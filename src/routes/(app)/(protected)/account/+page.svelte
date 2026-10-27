<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { useSession, homeFor } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	const session = useSession();
	const queries = useQueryClient();
	const sessions = createQuery(() => ({
		queryKey: ['account', session.user?.id, 'sessions'],
		queryFn: ({ signal }) =>
			session.api.request<{ id: string; createdAt: string; expiresAt: string }[]>('/me/sessions', {
				signal
			})
	}));
	const revoke = createMutation(() => ({
		mutationFn: (id: string) => session.api.request('/me/sessions/' + id, { method: 'DELETE' }),
		onSuccess: () => queries.invalidateQueries({ queryKey: ['account'] })
	}));
</script>

<svelte:head
	><title>Akun & sesi — Upstream</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<main class="portal">
	<a class="text-link" href={session.user ? homeFor(session.user) : resolve('/(app)/login')}
		>← Kembali ke workspace</a
	>
	<p class="eyebrow">AKSES ANDA</p>
	<h1>Akun & sesi.</h1>
	<p class="lead">{session.user?.email}</p>
	<section class="panel">
		<h2>Sesi aktif</h2>
		{#if sessions.isPending}<p role="status">Memuat sesi…</p>{:else if sessions.isError}<p
				role="alert"
			>
				{errorMessage(sessions.error)}
			</p>{:else}{#each sessions.data || [] as item (item.id)}<div class="session-row">
					<div>
						<strong>{item.id === session.user?.sessionId ? 'Sesi saat ini' : 'Sesi lain'}</strong>
						<p class="muted">Login {new Date(item.createdAt).toLocaleString('id-ID')}</p>
					</div>
					{#if item.id !== session.user?.sessionId}<button
							class="button secondary"
							disabled={revoke.isPending}
							onclick={() => revoke.mutate(item.id)}>Cabut sesi</button
						>{/if}
				</div>{/each}{/if}{#if revoke.isError}<p class="notice error" role="alert">
				{errorMessage(revoke.error)}
			</p>{/if}
	</section>
</main>
