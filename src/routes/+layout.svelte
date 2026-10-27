<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { ApiClient, ApiError } from '#lib/api/client.ts';
	import { AuthSession, provideSession } from '#lib/auth/session.svelte.ts';
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

	const session = provideSession(
		new AuthSession(new ApiClient(typeof window !== 'undefined' ? localStorage : dummyStorage), queries)
	);

	onMount(() => {
		const stop = session.listen();
		void session.bootstrap();
		return stop;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queries}>{@render children()}</QueryClientProvider>
