<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation } from '@tanstack/svelte-query';
	import AuthFrame from '#lib/components/AuthFrame.svelte';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	const session = useSession();
	let email = $state('');
	const request = createMutation(() => ({
		mutationFn: () =>
			session.api.request<{ message: string }>('/auth/forgot-password', {
				method: 'POST',
				anonymous: true,
				body: JSON.stringify({ email })
			})
	}));
</script>

<svelte:head><title>Pulihkan akun — Upstream</title></svelte:head>
<AuthFrame
	eyebrow="AKSES AKUN"
	title="Mulai kembali."
	subtitle="Kami akan mengirimkan tautan untuk mengatur ulang password Anda."
>
	<form
		onsubmit={(event) => {
			event.preventDefault();
			request.mutate();
		}}
	>
		<label for="email">Alamat email</label><input
			id="email"
			type="email"
			bind:value={email}
			required
			autocomplete="email"
		/>
		{#if request.isSuccess}<p class="notice" role="status">
				{request.data.message}
			</p>{/if}{#if request.isError}<p class="notice error" role="alert">
				{errorMessage(request.error)}
			</p>{/if}
		<button class="button full" disabled={request.isPending}
			>{request.isPending ? 'Mengirim…' : 'Kirim tautan pemulihan →'}</button
		>
	</form>
	<p class="form-footer"><a href={resolve('/(app)/login')}>← Kembali ke login</a></p>
</AuthFrame>
