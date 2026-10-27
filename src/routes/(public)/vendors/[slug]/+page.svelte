<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PublicJobCard from '#lib/components/PublicJobCard.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	function href(n: number) {
		return resolve(`/(public)/vendors/[slug]?page=${n}`, { slug: page.params.slug! });
	}
</script>

<svelte:head
	><title>{data.vendor.name} — Mitra Upstream</title><meta
		name="description"
		content={data.vendor.description.slice(0, 160)}
	/></svelte:head
><a class="back-link" href={resolve('/(public)/vendors')}>← Semua mitra</a>
<section class="public-detail-heading">
	<span class="company-monogram">{data.vendor.name.slice(0, 2).toUpperCase()}</span>
	<p class="eyebrow">MITRA TERVERIFIKASI / {data.vendor.industry}</p>
	<h1>{data.vendor.name}</h1>
	<p>{data.vendor.location}</p>
</section>
<section class="panel vendor-about">
	<div>
		<p class="eyebrow">TENTANG PERUSAHAAN</p>
		<h2>Kenali tempat Anda bertumbuh.</h2>
		<p class="preserve-lines">{data.vendor.description}</p>
	</div>
	{#if data.vendor.website}<a
			class="button secondary"
			href={data.vendor.website}
			target="_blank"
			rel="external noopener noreferrer">Website perusahaan ↗</a
		>{/if}
</section>
<div class="results-heading"><h2>{data.jobs.total} peluang bersama {data.vendor.name}.</h2></div>
<div class="public-job-grid">
	{#each data.jobs.items as job (job.id)}<PublicJobCard {job} />{:else}<div class="empty-state">
			<h2>Belum ada lowongan aktif.</h2>
			<p>Jelajahi peluang lain dari mitra Upstream.</p>
			<a class="text-link" href={resolve('/(public)/jobs')}>Temukan peluang →</a>
		</div>{/each}
</div>
<div class="pagination">
	<span>Halaman {data.jobs.page} dari {Math.max(data.jobs.totalPages, 1)}</span>
	<div>
		{#if data.jobs.page > 1}<a class="button secondary" href={href(data.jobs.page - 1)}
				>← Sebelumnya</a
			>{/if}{#if data.jobs.page < data.jobs.totalPages}<a
				class="button secondary"
				href={href(data.jobs.page + 1)}>Berikutnya →</a
			>{/if}
	</div>
</div>
