import { getContext, setContext } from 'svelte';
import { QueryClient } from '@tanstack/svelte-query';
import { ApiClient, ApiError, LOGOUT_KEY, TOKEN_KEY, type TokenResponse } from '#lib/api/client.ts';
import type { components } from '../api/schema';
export type User = components['schemas']['UserResponse'];
import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
export function homeFor(user: User): ResolvedPathname {
	if (['SUPERADMIN', 'TALENT_ACQUISITION', 'LEGAL'].includes(user.role))
		return resolve('/(app)/(protected)/admin');
	return user.role === 'VENDOR'
		? resolve('/(app)/(protected)/vendor')
		: resolve('/(app)/(protected)/candidate');
}
export function safeDestination(value: string | null, user: User): ResolvedPathname {
	const prefix = homeFor(user);
	return value && (value === prefix || value.startsWith(prefix + '/')) && !value.includes('\\')
		? (value as ResolvedPathname)
		: prefix;
}
export class AuthSession {
	user = $state<User | null>(null);
	status = $state<'initializing' | 'authenticated' | 'anonymous' | 'error'>('initializing');
	error = $state('');
	private epoch = 0;
	public readonly api: ApiClient;
	public readonly queries: QueryClient;
	constructor(api: ApiClient, queries: QueryClient) {
		this.api = api;
		this.queries = queries;
		api.onExpired = () => this.reset();
	}
	private reset() {
		this.epoch++;
		this.user = null;
		this.status = 'anonymous';
		void this.queries.cancelQueries();
		this.queries.clear();
	}
	async bootstrap() {
		const epoch = ++this.epoch;
		this.status = 'initializing';
		this.error = '';
		try {
			if (!this.api.token) await this.api.refresh();
			const user = await this.queries.fetchQuery({
				queryKey: ['auth', 'me'],
				queryFn: ({ signal }) => this.api.request<User>('/auth/me', { signal }),
				staleTime: 0,
				retry: false
			});
			if (epoch === this.epoch) {
				this.user = user;
				this.status = 'authenticated';
			}
		} catch (error) {
			if (epoch !== this.epoch) return;
			if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
				this.reset();
			} else {
				this.status = 'error';
				this.error = 'Sesi belum dapat diperiksa. Pastikan API tersedia, lalu coba kembali.';
			}
		}
	}
	async accept(result: TokenResponse) {
		this.api.clear();
		this.reset();
		this.status = 'initializing';
		this.api.setToken(result.accessToken);
		await this.bootstrap();
		if (!this.user) throw new Error(this.error || 'Sesi tidak dapat dimuat.');
	}
	async login(input: { email: string; password: string }) {
		const result = await this.api.request<TokenResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(input),
			anonymous: true
		});
		await this.accept(result);
	}
	async logout() {
		// Keep a visible error if server revocation fails rather than reporting a successful logout.
		await this.api.request('/auth/logout', { method: 'POST', anonymous: true });
		this.api.clear();
		this.reset();
		localStorage.setItem(LOGOUT_KEY, crypto.randomUUID());
	}
	listen() {
		const listener = (event: StorageEvent) => {
			if (event.key === LOGOUT_KEY || (event.key === TOKEN_KEY && !event.newValue)) {
				this.api.clear();
				this.reset();
			} else if (event.key === TOKEN_KEY && event.newValue && this.status !== 'initializing') {
				this.reset();
				void this.bootstrap();
			}
		};
		window.addEventListener('storage', listener);
		return () => window.removeEventListener('storage', listener);
	}
}
const SESSION = Symbol('upstream.session');
export const provideSession = (session: AuthSession) => setContext(SESSION, session);
export const useSession = () => getContext<AuthSession>(SESSION);
