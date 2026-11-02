<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { createQuery } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { Job } from '#lib/marketplace/types.ts';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import JobContent from '#lib/components/JobContent.svelte';
	import ReviewDecision from '#lib/components/ReviewDecision.svelte';
	import ReviewHistory from '#lib/components/ReviewHistory.svelte';
	const session = useSession('admin');
	const allowed = $derived(!!session.user?.permissions.includes('job.moderate'));
	const job = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'jobs', 'detail', page.params.id],
		enabled: allowed,
		queryFn: ({ signal }) => session.api.request<Job>('/admin/jobs/' + page.params.id, { signal })
	}));
</script>

<svelte:head><title>{job.data?.title || 'Moderasi lowongan'} — Upstream</title></svelte:head>
{#if !allowed}<p class="notice error" role="alert">
		Anda tidak memiliki akses moderasi lowongan.
	</p>{:else if job.isPending}<p class="notice" role="status">
		Memuat lowongan…
	</p>{:else if job.isError}<p class="notice error" role="alert">
		{errorMessage(job.error)}
	</p>{:else if job.data}{@const j = job.data}
	<div class="page-heading">
		<div>
			<p class="eyebrow">MODERASI LOWONGAN</p>
			<h1>{j.title}</h1>
			<p class="muted">{j.vendor.name} · Clearance vendor: {j.vendorStatus}</p>
			<div class="inline-actions">
				<StatusBadge status={j.moderationStatus} /><StatusBadge status={j.publicationStatus} />
			</div>
		</div>
		{#if session.user?.permissions.includes('vendor.verify')}<a
				class="button secondary"
				href={resolve('/(app)/(protected)/admin/vendors/[id]', { id: j.vendor.id })}
				>Lihat vendor ↗</a
			>{/if}
	</div>
	<div class="review-layout">
		<div>
			<section class="panel">
				<JobContent job={j} />{#if !j.salaryVisible}<p class="notice">
						Gaji tidak ditampilkan ke publik. Nilai untuk review: {j.salaryMin?.toLocaleString(
							'id-ID'
						)} – {j.salaryMax?.toLocaleString('id-ID')} IDR / {j.salaryPeriod}.
					</p>{/if}
			</section>
			<section class="panel"><ReviewHistory reviews={j.reviews} /></section>
		</div>
		{#key j.version}<ReviewDecision
				kind="jobs"
				id={j.id}
				version={j.version}
				status={j.publicationStatus === 'closed' ? 'closed' : j.moderationStatus}
			/>{/key}
	</div>{/if}
