<script lang="ts">
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
	const session = provideSession(new AuthSession(new ApiClient(localStorage), queries));
	onMount(() => {
		const stop = session.listen();
		void session.bootstrap();
		return stop;
	});
</script>

<QueryClientProvider client={queries}>{@render children()}</QueryClientProvider>
