<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AuthFrame from '#lib/components/AuthFrame.svelte';
	import { useSession, safeDestination } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	const session = useSession();
	let email = $state('');
	let password = $state('');
	const login = createMutation(() => ({ mutationFn: () => session.login({ email, password }) }));
	const providers = createQuery(() => ({
		queryKey: ['auth', 'providers'],
		queryFn: ({ signal }) =>
			session.api.request<{ google: boolean }>('/auth/providers', { anonymous: true, signal }),
		retry: false
	}));
	const google = createMutation(() => ({
		mutationFn: async () => {
			const result = await session.api.request<{ url: string }>('/auth/google/authorize', {
				anonymous: true
			});
			window.location.assign(result.url);
		}
	}));
	$effect(() => {
		if (session.status === 'authenticated' && session.user)
			void goto(safeDestination(page.url.searchParams.get('returnTo'), session.user), {
				replaceState: true
			});
	});
</script>

<svelte:head><title>Masuk — Upstream</title></svelte:head>
<AuthFrame title="Masuk ke portal." subtitle="Lanjutkan perjalanan Anda bersama Upstream.">
	<form
		onsubmit={(event) => {
			event.preventDefault();
			login.mutate();
		}}
	>
		<label for="email">Alamat email</label><input
			id="email"
			type="email"
			autocomplete="email"
			bind:value={email}
			required
			placeholder="nama@perusahaan.com"
		/>
		<div class="label-row">
			<label for="password">Password</label><a href={resolve('/(app)/forgot-password')}
				>Lupa password?</a
			>
		</div>
		<input
			id="password"
			type="password"
			autocomplete="current-password"
			bind:value={password}
			required
			maxlength="128"
			placeholder="Masukkan password Anda"
		/>
		{#if login.isError}<p class="notice error" role="alert">{errorMessage(login.error)}</p>{/if}
		<button class="button full" disabled={login.isPending || session.status === 'initializing'}
			>{login.isPending ? 'Memeriksa akun…' : 'Masuk ke portal'} <span>↗</span></button
		>
	</form>
	{#if session.status === 'error'}<p class="notice error" role="alert">{session.error}</p>
		<button class="text-button" onclick={() => session.bootstrap()}>Periksa koneksi kembali</button
		>{/if}
	{#if providers.data?.google}<div class="divider">atau</div>
		<button
			class="button secondary full"
			disabled={google.isPending}
			onclick={() => google.mutate()}>Lanjutkan dengan Google</button
		>{/if}
	{#if google.isError}<p class="notice error" role="alert">{errorMessage(google.error)}</p>{/if}
	<p class="form-footer">Belum punya akun? <a href={resolve('/(app)/register')}>Buat akun →</a></p>
</AuthFrame>
