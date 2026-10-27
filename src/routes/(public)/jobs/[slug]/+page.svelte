<script lang="ts">
	import { resolve } from '$app/paths';
	import { salaryLabel, statusLabel, dateLabel } from '#lib/marketplace/types.ts';
	import JobContent from '#lib/components/JobContent.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head
	><title>{data.job.title} di {data.job.vendor.name} — Upstream</title><meta
		name="description"
		content={data.job.description.slice(0, 160)}
	/><meta property="og:title" content={data.job.title + ' — ' + data.job.vendor.name} /><meta
		property="og:description"
		content={data.job.description.slice(0, 160)}
	/></svelte:head
>
<a class="back-link" href={resolve('/(public)/jobs')}>← Semua peluang</a>
<section class="public-detail-heading">
	<span class="company-monogram">{data.job.vendor.name.slice(0, 2).toUpperCase()}</span>
	<p class="eyebrow">{data.job.industry} / {statusLabel[data.job.employmentType]}</p>
	<h1>{data.job.title}</h1>
	<p>
		<a href={resolve('/(public)/vendors/[slug]', { slug: data.job.vendor.slug })}
			>{data.job.vendor.name} ↗</a
		> <span>·</span>
		{data.job.location}
	</p>
</section>
<div class="public-detail-layout">
	<section class="panel"><JobContent job={data.job} /></section>
	<aside class="apply-panel">
		<p class="eyebrow">LANGKAH BERIKUTNYA</p>
		<h2>Peluang untuk<br /><em>cerita baru.</em></h2>
		<strong>{salaryLabel(data.job)}</strong>
		<p>{data.job.openings} posisi tersedia<br />Batas lamaran: {dateLabel(data.job.deadline)}</p>
		<a class="button full" href={resolve('/(app)/login?returnTo=%2Fcandidate')}
			>Masuk sebagai kandidat ↗</a
		>
		<p class="muted">Masuk untuk melengkapi profil kandidat Anda.</p>
		<div class="verified-caption"><span class="status-dot"></span> MITRA TELAH DIVERIFIKASI</div>
	</aside>
</div>
