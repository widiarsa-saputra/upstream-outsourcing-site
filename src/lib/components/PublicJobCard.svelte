<script lang="ts">
	import { resolve } from '$app/paths';
	import { salaryLabel, statusLabel, type PublicJob } from '#lib/marketplace/types.ts';
	let { job }: { job: PublicJob } = $props();
</script>

<article class="public-job-card">
	<div class="job-card-top">
		<span class="company-monogram" aria-hidden="true"
			>{job.vendor.name.slice(0, 2).toUpperCase()}</span
		><span class="job-type">{statusLabel[job.employmentType]}</span>
	</div>
	<p class="job-company">{job.vendor.name}</p>
	<h2><a href={resolve('/(public)/jobs/[slug]', { slug: job.slug })}>{job.title}</a></h2>
	<p class="job-card-location">{job.location} <span>·</span> {statusLabel[job.workMode]}</p>
	<p class="job-card-description">
		{job.description.slice(0, 140)}{job.description.length > 140 ? '…' : ''}
	</p>
	<div class="job-card-bottom">
		<span>{salaryLabel(job)}</span><a
			href={resolve('/(public)/jobs/[slug]', { slug: job.slug })}
			aria-label={'Lihat lowongan ' + job.title}>↗</a
		>
	</div>
</article>
