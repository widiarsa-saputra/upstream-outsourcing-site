<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation } from '@tanstack/svelte-query';
	import { useSession, homeFor } from '#lib/auth/session.svelte.ts';
	import { goto } from '$app/navigation';
	import { errorMessage } from '#lib/api/client.ts';
	let { role }: { role: 'CANDIDATE' | 'VENDOR' } = $props();
	const session = useSession();
	const logout = createMutation(() => ({ mutationFn: () => session.logout() }));
	const resend = createMutation(() => ({
		mutationFn: () =>
			session.api.request<{ message: string }>('/auth/resend-verification', {
				method: 'POST',
				anonymous: true,
				body: JSON.stringify({ email: session.user?.email })
			})
	}));
	$effect(() => {
		if (session.user && session.user.role !== role)
			void goto(homeFor(session.user), { replaceState: true });
	});
</script>

<svelte:head
	><title>Portal {role === 'VENDOR' ? 'mitra' : 'kandidat'} — Upstream</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<main class="portal">
	<header class="public-header">
		<a class="brand" href={resolve('/')}>upstream.</a><button
			class="text-button"
			disabled={logout.isPending}
			onclick={() => logout.mutate()}>Keluar ↗</button
		>
	</header>
	<p class="eyebrow">PORTAL {role === 'VENDOR' ? 'MITRA' : 'KANDIDAT'}</p>
	<h1>Selamat datang,<br /><em>{session.user?.name}.</em></h1>
	<p class="lead">
		Akun Anda sudah siap. {role === 'VENDOR'
			? 'Pengisian legalitas dan pengajuan verifikasi perusahaan akan tersedia pada tahap vendor.'
			: 'Pengisian profil, dokumen, dan lamaran akan tersedia pada tahap kandidat.'}
	</p>
	<a class="button secondary" href={resolve('/(app)/(protected)/account')}>Kelola akun & sesi →</a
	>{#if !session.user?.emailVerified}<div class="notice">
			<p>Verifikasi alamat email untuk melengkapi akun.</p>
			<button class="text-button" disabled={resend.isPending} onclick={() => resend.mutate()}
				>Kirim ulang tautan verifikasi →</button
			>{#if resend.isSuccess}<p role="status">{resend.data.message}</p>{/if}
		</div>{/if}{#if logout.isError || resend.isError}<p class="notice error" role="alert">
			{errorMessage(logout.error || resend.error)}
		</p>{/if}
</main>
