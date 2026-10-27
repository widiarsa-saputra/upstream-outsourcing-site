<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import {
		ApiClient,
		ApiError,
		USER_TOKEN_KEY,
		USER_LOGOUT_KEY,
		ADMIN_TOKEN_KEY,
		ADMIN_LOGOUT_KEY
	} from '#lib/api/client.ts';
	import {
		AuthSession,
		provideUserSession,
		provideAdminSession
	} from '#lib/auth/session.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const queries = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30000,
				retry: (count, error) => count < 2 && (!(error instanceof ApiError) || error.status >= 500)
			},
			mutations: { retry: false }
		}
	});

	const dummyStorage: Storage = {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {},
		clear: () => {},
		key: () => null,
		length: 0
	};

	const storage = typeof window !== 'undefined' ? localStorage : dummyStorage;

	// User session terpisah (kandidat pelamar & mitra penyelenggara): key = upstream.user_token
	const userSession = provideUserSession(
		new AuthSession(new ApiClient(storage, fetch, USER_TOKEN_KEY, USER_LOGOUT_KEY), queries, 'user')
	);

	// Admin session terpisah (staf internal & superadmin): key = upstream.admin_token
	const adminSession = provideAdminSession(
		new AuthSession(new ApiClient(storage, fetch, ADMIN_TOKEN_KEY, ADMIN_LOGOUT_KEY), queries, 'admin')
	);

	onMount(() => {
		const stopUser = userSession.listen();
		const stopAdmin = adminSession.listen();

		void userSession.bootstrap();
		void adminSession.bootstrap();

		return () => {
			stopUser();
			stopAdmin();
		};
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queries}>{@render children()}</QueryClientProvider>
