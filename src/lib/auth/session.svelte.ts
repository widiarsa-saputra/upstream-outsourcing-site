import { getContext, setContext } from 'svelte';
import { QueryClient } from '@tanstack/svelte-query';
import {
	ApiClient,
	ApiError,
	type TokenResponse
} from '#lib/api/client.ts';
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
	public readonly scope: 'user' | 'admin';

	constructor(api: ApiClient, queries: QueryClient, scope: 'user' | 'admin' = 'user') {
		this.api = api;
		this.queries = queries;
		this.scope = scope;
		api.onExpired = () => this.reset();
	}

	reset() {
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

		// Jika tidak ada token pada scope ini, langsung set anonymous.
		// JANGAN memanggil api.refresh() jika storage kosong agar tidak mencuri refresh cookie dari scope lain!
		if (!this.api.token) {
			this.reset();
			return;
		}

		try {
			const res = await this.queries.fetchQuery({
				queryKey: ['auth', 'me', this.scope],
				queryFn: ({ signal }) => this.api.request<User | { data: User }>('/auth/me', { signal }),
				staleTime: 0,
				retry: false
			});
			if (epoch === this.epoch) {
				const rawUser = (res && typeof res === 'object' && 'data' in res && res.data ? res.data : res) as User;
				const user: User = { ...rawUser };
				if ((user.role as string) === 'admin') {
					user.role = 'SUPERADMIN';
				}
				if (Array.isArray(user.permissions)) {
					user.permissions = user.permissions
						.map((p: unknown) => (typeof p === 'string' ? p : (p as { name?: string }).name || ''))
						.filter(Boolean);
				} else {
					user.permissions = [];
				}

				if (user.role === 'SUPERADMIN') {
					const adminPerms = [
						'admin.overview',
						'staff.manage',
						'vendor.verify',
						'job.moderate',
						'document.verify',
						'application.screen',
						'audit.read'
					];
					for (const p of adminPerms) {
						if (!user.permissions.includes(p)) {
							user.permissions.push(p);
						}
					}
				}

				const isAdmin = ['SUPERADMIN', 'TALENT_ACQUISITION', 'LEGAL'].includes(user.role);
				if (this.scope === 'user' && isAdmin) {
					// Akun admin tidak diizinkan menempati sesi user publik
					this.api.clear();
					this.reset();
					this.status = 'error';
					this.error =
						'Akun ini adalah akun Staf/Administrator. Silakan masuk melalui Halaman Login Admin (/admin/login).';
					return;
				}
				if (this.scope === 'admin' && !isAdmin) {
					// Akun non-admin tidak diizinkan menempati sesi admin
					this.api.clear();
					this.reset();
					this.status = 'error';
					this.error =
						'Akses ditolak: Akun Anda bukan akun Staf Internal atau Administrator Upstream.';
					return;
				}
				this.user = user;
				this.status = 'authenticated';
			}
		} catch (error) {
			if (epoch !== this.epoch) return;
			if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
				this.api.clear();
				this.reset();
			} else {
				this.status = 'error';
				this.error = 'Sesi belum dapat diperiksa. Pastikan API tersedia, lalu coba kembali.';
			}
		}
	}

	async accept(result: TokenResponse & { token?: string }) {
		this.api.clear();
		this.reset();
		this.status = 'initializing';
		const token = result.accessToken || result.token;
		if (token) this.api.setToken(token);
		await this.bootstrap();
		if (!this.user) throw new Error(this.error || 'Sesi tidak dapat dimuat.');
	}

	async login(input: { email: string; password: string }) {
		const result = await this.api.request<TokenResponse & { token?: string }>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(input),
			anonymous: true
		});
		await this.accept(result);
		if (this.user) {
			const isAdmin = ['SUPERADMIN', 'TALENT_ACQUISITION', 'LEGAL'].includes(this.user.role);
			if (this.scope === 'user' && isAdmin) {
				await this.logout();
				throw new Error(
					'Akun ini adalah akun staf/administrator. Portal ini khusus untuk kandidat pelamar dan mitra penyelenggara.'
				);
			}
			if (this.scope === 'admin' && !isAdmin) {
				await this.logout();
				throw new Error('Akses ditolak: Akun Anda bukan akun Staf Internal atau Administrator Upstream.');
			}
		}
	}

	async logout() {
		try {
			await this.api.request('/auth/logout', { method: 'POST', anonymous: true });
		} catch {
			// ignore network error on logout
		}
		this.api.clear();
		this.reset();
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(this.api.logoutKey, crypto.randomUUID());
		}
	}

	listen() {
		const listener = (event: StorageEvent) => {
			if (event.key === this.api.logoutKey || (event.key === this.api.tokenKey && !event.newValue)) {
				this.api.clear();
				this.reset();
			} else if (event.key === this.api.tokenKey && event.newValue && this.status !== 'initializing') {
				this.reset();
				void this.bootstrap();
			}
		};
		if (typeof window !== 'undefined') {
			window.addEventListener('storage', listener);
			return () => window.removeEventListener('storage', listener);
		}
		return () => {};
	}
}

const USER_SESSION = Symbol('upstream.user.session');
const ADMIN_SESSION = Symbol('upstream.admin.session');

export const provideSession = (session: AuthSession) => setContext(USER_SESSION, session);
export const provideUserSession = (session: AuthSession) => setContext(USER_SESSION, session);
export const provideAdminSession = (session: AuthSession) => setContext(ADMIN_SESSION, session);

export const useSession = (overrideScope?: 'user' | 'admin'): AuthSession => {
	const admin = getContext<AuthSession>(ADMIN_SESSION);
	const user = getContext<AuthSession>(USER_SESSION);
	if (overrideScope === 'admin') return admin || user;
	if (overrideScope === 'user') return user || admin;
	if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
		return admin || user;
	}
	return user || admin;
};

export const useUserSession = () => getContext<AuthSession>(USER_SESSION);
export const useAdminSession = () => getContext<AuthSession>(ADMIN_SESSION) || getContext<AuthSession>(USER_SESSION);
