<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import AuthFrame from './AuthFrame.svelte';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	let { mode }: { mode: 'verify' | 'reset' } = $props();
	const session = useSession();
	let token = $state('');
	let password = $state('');
	onMount(() => {
		token = new URLSearchParams(location.hash.slice(1)).get('token') || '';
		history.replaceState(null, '', location.pathname);
	});
	const action = createMutation(() => ({
		mutationFn: () =>
			session.api.request<{ message: string }>(
				mode === 'verify' ? '/auth/verify-email' : '/auth/reset-password',
				{
					method: 'POST',
					anonymous: true,
					body: JSON.stringify(mode === 'verify' ? { token } : { token, password })
				}
			)
	}));
</script>

<svelte:head
	><title>{mode === 'verify' ? 'Verifikasi email' : 'Password baru'} — Upstream</title></svelte:head
>
<AuthFrame
	eyebrow="KEAMANAN AKUN"
	title={mode === 'verify' ? 'Verifikasi email Anda.' : 'Password yang baru.'}
	subtitle={mode === 'verify'
		? 'Konfirmasi alamat email untuk melengkapi akun Anda.'
		: 'Gunakan password baru dengan minimal 12 karakter.'}
>
	{#if action.isSuccess}<p class="notice" role="status">{action.data.message}</p>
		<a class="button full" href={resolve('/(app)/login')}>Kembali ke login →</a>
	{:else if !token}<p class="notice error" role="alert">
			Tautan tidak lengkap. Buka kembali tautan terbaru dari email Anda.
		</p>
		<a class="text-link" href={resolve('/(app)/login')}>Kembali ke login</a>
	{:else}<form
			onsubmit={(event) => {
				event.preventDefault();
				action.mutate();
			}}
		>
			{#if mode === 'reset'}<label for="password">Password baru</label><input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength="12"
					maxlength="128"
					autocomplete="new-password"
				/>{/if}
			{#if action.isError}<p class="notice error" role="alert">
					{errorMessage(action.error)}
				</p>{/if}<button class="button full" disabled={action.isPending}
				>{action.isPending
					? 'Memproses…'
					: mode === 'verify'
						? 'Verifikasi email →'
						: 'Simpan password →'}</button
			>
		</form>{/if}
</AuthFrame>
