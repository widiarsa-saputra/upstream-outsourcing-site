<script lang="ts">
	import { resolve } from '$app/paths';
	import { salaryLabel, statusLabel, type PublicJob } from '#lib/marketplace/types.ts';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Application } from '#lib/candidate/applications.ts';

	let { job, isApplied: isAppliedProp }: { job: PublicJob; isApplied?: boolean } = $props();

	const session = useSession('user');

	const myAppsQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'applications'],
		enabled: !!session.user && session.user.role === 'CANDIDATE' && isAppliedProp === undefined,
		queryFn: ({ signal }) => session.api.request<Application[]>('/candidate/applications', { signal })
	}));

	const isApplied = $derived(
		isAppliedProp ?? Boolean(myAppsQuery.data?.some((app) => app.jobId === job.id))
	);
</script>

<article class="public-job-card">
	<div class="job-card-top">
		<span class="company-monogram" aria-hidden="true"
			>{job.vendor.name.slice(0, 2).toUpperCase()}</span
		>
		<div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end;">
			<span class="job-type">{statusLabel[job.employmentType]}</span>
			{#if session.user && session.user.role === 'CANDIDATE'}
				{#if isApplied}
					<span
						style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; display: inline-flex; align-items: center; gap: 3px;"
						title="Anda telah melamar lowongan ini"
					>
						✓ DONE
					</span>
				{:else}
					<span
						style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;"
						title="Belum diajukan lamaran"
					>
						Belum
					</span>
				{/if}
			{/if}
		</div>
	</div>
	<p class="job-company">{job.vendor.name}</p>
	<h2><a href={resolve('/(public)/jobs/[slug]', { slug: job.slug })}>{job.title}</a></h2>
	<p class="job-card-location">{job.location} <span>·</span> {statusLabel[job.workMode]}</p>
	<p class="job-card-description">
		{job.description.slice(0, 140)}{job.description.length > 140 ? '…' : ''}
	</p>
	<div class="job-card-bottom">
		<span>{salaryLabel(job)}</span>
		<div style="display: flex; gap: 10px; align-items: center;">
			{#if session.user && session.user.role === 'CANDIDATE' && isApplied}
				<a
					href={resolve('/(app)/(protected)/candidate/applications')}
					style="font-size: 11px; font-weight: 700; color: #0284c7; text-decoration: underline;"
				>
					Status Progres ↗
				</a>
			{/if}
			<a
				href={resolve('/(public)/jobs/[slug]', { slug: job.slug })}
				aria-label={'Lihat lowongan ' + job.title}>↗</a
			>
		</div>
	</div>
</article>
