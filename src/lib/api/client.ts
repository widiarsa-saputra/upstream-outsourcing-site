import { PUBLIC_API_URL } from '$app/env/public';
export const TOKEN_KEY = 'upstream.access_token';
export const LOGOUT_KEY = 'upstream.logout';
import type { components } from './schema';
export type TokenResponse = components['schemas']['TokenResponse'];
export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
		public fieldErrors?: Record<string, string[]>
	) {
		super(message);
	}
}
export const apiBase = PUBLIC_API_URL || 'http://localhost:3001/api/v1';
type Options = RequestInit & {
	anonymous?: boolean;
	responseType?: 'json' | 'blob';
	timeoutMs?: number;
};
export class ApiClient {
	private refreshPromise: Promise<void> | null = null;
	private generation = 0;
	onExpired = () => {};
	constructor(
		private readonly storage: Storage,
		private readonly fetcher: typeof fetch = fetch
	) {}
	get token() {
		return this.storage.getItem(TOKEN_KEY);
	}
	setToken(token: string) {
		this.storage.setItem(TOKEN_KEY, token);
	}
	clear() {
		this.generation++;
		this.storage.removeItem(TOKEN_KEY);
	}
	async request<T>(path: string, options: Options = {}): Promise<T> {
		const generation = this.generation;
		const send = async () => {
			const headers = new Headers(options.headers);
			if (typeof options.body === 'string' && !headers.has('Content-Type'))
				headers.set('Content-Type', 'application/json');
			if (!options.anonymous && this.token) headers.set('Authorization', `Bearer ${this.token}`);
			return this.fetcher(apiBase + path, {
				...options,
				headers,
				credentials: 'include',
				signal: options.signal
					? AbortSignal.any([options.signal, AbortSignal.timeout(options.timeoutMs ?? 15000)])
					: AbortSignal.timeout(options.timeoutMs ?? 15000)
			});
		};
		let response = await send();
		if (response.status === 401 && !options.anonymous) {
			await this.refresh();
			if (generation !== this.generation)
				throw new ApiError(401, 'SESSION_CHANGED', 'Sesi sudah berubah.');
			response = await send();
			if (response.status === 401) {
				this.clear();
				this.onExpired();
			}
		}
		if (generation !== this.generation)
			throw new ApiError(401, 'SESSION_CHANGED', 'Sesi sudah berubah.');
		if (response.ok && options.responseType === 'blob') {
			const blob = await response.blob();
			if (generation !== this.generation)
				throw new ApiError(401, 'SESSION_CHANGED', 'Sesi sudah berubah.');
			return blob as T;
		}
		const body = await response.json().catch(() => ({}));
		if (generation !== this.generation)
			throw new ApiError(401, 'SESSION_CHANGED', 'Sesi sudah berubah.');
		if (!response.ok)
			throw new ApiError(
				response.status,
				body.code || 'REQUEST_FAILED',
				Array.isArray(body.message) ? body.message.join(' ') : body.message || 'Permintaan gagal.',
				body.fieldErrors
			);
		return body as T;
	}
	async refresh() {
		if (!this.refreshPromise) {
			const tokenBefore = this.token;
			const generation = this.generation;
			const run = async () => {
				// Another tab may have already rotated the shared cookie while this tab waited.
				if (generation !== this.generation)
					throw new ApiError(401, 'SESSION_CHANGED', 'Sesi sudah berubah.');
				if (this.token && this.token !== tokenBefore) return;
				try {
					const result = await this.request<TokenResponse>('/auth/refresh', {
						method: 'POST',
						anonymous: true
					});
					if (generation === this.generation) this.setToken(result.accessToken);
				} catch (error) {
					if (error instanceof ApiError && error.status === 401) {
						this.clear();
						this.onExpired();
					}
					throw error;
				}
			};
			this.refreshPromise = (
				typeof navigator !== 'undefined' && navigator.locks
					? navigator.locks.request('upstream-refresh', run)
					: run()
			).finally(() => {
				this.refreshPromise = null;
			});
		}
		return this.refreshPromise;
	}
}
export const errorMessage = (error: unknown) =>
	error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba kembali.';

export const fieldError = (error: unknown, field: string) =>
	error instanceof ApiError ? error.fieldErrors?.[field]?.join(' ') : undefined;
