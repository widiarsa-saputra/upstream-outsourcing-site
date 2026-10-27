import { describe, it, expect, vi } from 'vitest';
import { ApiClient, ApiError, TOKEN_KEY } from './client';
vi.mock('$app/env/public', () => ({ PUBLIC_API_URL: 'http://localhost:3001/api/v1' }));
function storage(): Storage {
	const data = new Map<string, string>();
	return {
		get length() {
			return data.size;
		},
		clear: () => data.clear(),
		getItem: (k) => data.get(k) ?? null,
		setItem: (k, v) => {
			data.set(k, v);
		},
		removeItem: (k) => {
			data.delete(k);
		},
		key: (i) => [...data.keys()][i] ?? null
	};
}
const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
describe('authenticated API client', () => {
	it('coalesces concurrent 401s into one refresh and retries with the new access token', async () => {
		const store = storage();
		store.setItem(TOKEN_KEY, 'old');
		let refreshes = 0;
		const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			if (String(input).endsWith('/auth/refresh')) {
				refreshes++;
				await new Promise((resolve) => setTimeout(resolve, 10));
				return json({ accessToken: 'new', expiresIn: 900 });
			}
			return new Headers(init?.headers).get('Authorization') === 'Bearer new'
				? json({ ok: true })
				: json({ message: 'Expired' }, 401);
		});
		const api = new ApiClient(store, fetcher);
		const result = await Promise.all([api.request('/admin/overview'), api.request('/admin/staff')]);
		expect(refreshes).toBe(1);
		expect(result).toEqual([{ ok: true }, { ok: true }]);
		expect(store.getItem(TOKEN_KEY)).toBe('new');
	});
	it('does not refresh forbidden requests', async () => {
		const fetcher = vi.fn(async () => json({ code: 'FORBIDDEN', message: 'Tidak diizinkan' }, 403));
		const api = new ApiClient(storage(), fetcher);
		await expect(api.request('/admin/overview')).rejects.toMatchObject({ status: 403 });
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
	it('clears credentials and expires the session when refresh is rejected without looping', async () => {
		const store = storage();
		store.setItem(TOKEN_KEY, 'expired');
		const fetcher = vi.fn(async () => json({ message: 'Expired' }, 401));
		const api = new ApiClient(store, fetcher);
		const expired = vi.fn();
		api.onExpired = expired;
		await expect(api.request('/auth/me')).rejects.toBeInstanceOf(ApiError);
		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(expired).toHaveBeenCalledOnce();
		expect(api.token).toBeNull();
	});
	it('preserves the session on transient refresh failures', async () => {
		const store = storage();
		store.setItem(TOKEN_KEY, 'old');
		const fetcher = vi.fn(async (input: RequestInfo | URL) =>
			String(input).endsWith('/auth/refresh')
				? json({ message: 'Unavailable' }, 503)
				: json({}, 401)
		);
		const api = new ApiClient(store, fetcher);
		const expired = vi.fn();
		api.onExpired = expired;
		await expect(api.request('/auth/me')).rejects.toMatchObject({ status: 503 });
		expect(expired).not.toHaveBeenCalled();
		expect(api.token).toBe('old');
	});
	it('cannot restore credentials from a late refresh after clear/logout', async () => {
		const store = storage();
		store.setItem(TOKEN_KEY, 'old');
		let release!: (response: Response) => void;
		const fetcher = vi.fn(
			() =>
				new Promise<Response>((resolve) => {
					release = resolve;
				})
		);
		const api = new ApiClient(store, fetcher);
		const refresh = api.refresh();
		api.clear();
		release(json({ accessToken: 'late' }));
		await expect(refresh).rejects.toMatchObject({ code: 'SESSION_CHANGED' });
		expect(api.token).toBeNull();
	});
});
