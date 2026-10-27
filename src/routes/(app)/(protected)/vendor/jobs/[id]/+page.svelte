<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { createQuery } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { Job } from '#lib/marketplace/types.ts';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import JobContent from '#lib/components/JobContent.svelte';
	import JobActions from '#lib/components/JobActions.svelte';
	import ReviewHistory from '#lib/components/ReviewHistory.svelte';
	const session = useSession();
	const job = createQuery(() => ({
		queryKey: ['vendor', session.user?.id, 'job', page.params.id],
		enabled: session.user?.role === 'VENDOR',
		queryFn: ({ signal }) => session.api.request<Job>('/vendor/jobs/' + page.params.id, { signal })
	}));
</script>

<svelte:head><title>{job.data?.title || 'Detail lowongan'} — Upstream</title></svelte:head>
{#if job.isPending}<p class="notice" role="status">Memuat lowongan…</p>{:else if job.isError}<p
		class="notice error"
		role="alert"
	>
		{errorMessage(job.error)}
	</p>{:else if job.data}{@const item = job.data}
	<div class="page-heading">
		<div>
			<p class="eyebrow">LOWONGAN ANDA</p>
			<h1>{item.title}</h1>
			<div class="inline-actions">
				<StatusBadge status={item.moderationStatus} /><StatusBadge
					status={item.publicationStatus}
				/>
			</div>
		</div>
		{#if item.publicationStatus !== 'closed'}<a
				class="button secondary"
				href={resolve('/(app)/(protected)/vendor/jobs/[id]/edit', { id: item.id })}
				>Edit lowongan ↗</a
			>{/if}
	</div>
	{#if item.reviewReason}<p class="notice">Catatan moderasi: {item.reviewReason}</p>{/if}<JobActions
		job={item}
	/>
	<section class="panel detail-panel"><JobContent job={item} /></section>
	<section class="panel"><ReviewHistory reviews={item.reviews} /></section>{/if}
