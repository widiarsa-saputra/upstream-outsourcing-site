<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createMutation } from '@tanstack/svelte-query';
	import { useSession, homeFor } from '#lib/auth/session.svelte.ts';
	import { errorMessage, type TokenResponse } from '#lib/api/client.ts';
	const session = useSession();
	const exchange = createMutation(() => ({
		mutationFn: async (input: { code: string; state: string }) => {
			const result = await session.api.request<TokenResponse>('/auth/google/exchange', {
				method: 'POST',
				anonymous: true,
				body: JSON.stringify(input)
			});
			await session.accept(result);
			if (session.user) await goto(homeFor(session.user), { replaceState: true });
		}
	}));
	onMount(() => {
		const params = new URLSearchParams(location.search);
		const code = params.get('code'),
			state = params.get('state');
		history.replaceState(null, '', location.pathname);
		if (code && state) exchange.mutate({ code, state });
	});
</script>

<svelte:head><title>Google login — Upstream</title></svelte:head>
<main class="center-state">
	<a class="brand" href={resolve('/')}>upstream.</a>
	<h1>Menghubungkan akun.</h1>
	{#if exchange.isError}<p role="alert">
			{errorMessage(exchange.error)}
		</p>{:else if exchange.isPending}<p role="status">Sedang memverifikasi akun Google…</p>{:else}<p
		>
			Gunakan tombol Google di halaman login untuk melanjutkan.
		</p>{/if}<a class="text-link" href={resolve('/(app)/login')}>← Kembali ke login</a>
</main>
