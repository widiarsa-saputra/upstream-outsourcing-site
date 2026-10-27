<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	function href(n: number) {
		const q = new SvelteURLSearchParams(page.url.search);
		q.set('page', String(n));
		return resolve(`/(public)/vendors?${q}`);
	}
</script>

<svelte:head
	><title>Mitra perusahaan terverifikasi — Upstream</title><meta
		name="description"
		content="Kenali mitra perusahaan Upstream yang telah melalui verifikasi dan jelajahi lowongan aktif mereka."
	/></svelte:head
>
<section class="public-hero compact">
	<div>
		<p class="eyebrow">KEPERCAYAAN YANG MEMBUKA PELUANG</p>
		<h1>Kenali mitra<br /><em>perjalanan Anda.</em></h1>
		<p>Perusahaan yang membuka ruang bagi talenta untuk berkembang.</p>
	</div>
</section>
<form class="filter-bar" method="GET" action={resolve('/(public)/vendors')}>
	<input
		name="q"
		aria-label="Cari perusahaan"
		value={data.filters.q || ''}
		placeholder="Nama perusahaan…"
	/><input
		name="industry"
		aria-label="Industri perusahaan"
		value={data.filters.industry || ''}
		placeholder="Industri"
	/><input
		name="location"
		aria-label="Lokasi perusahaan"
		value={data.filters.location || ''}
		placeholder="Kota"
	/><button class="button">Cari mitra ↗</button><a
		class="text-link"
		href={resolve('/(public)/vendors')}>Reset</a
	>
</form>
<div class="results-heading"><h2>{data.vendors.total} mitra terverifikasi.</h2></div>
<div class="public-job-grid">
	{#each data.vendors.items as vendor (vendor.id)}<article class="public-job-card vendor-card">
			<span class="company-monogram">{vendor.name.slice(0, 2).toUpperCase()}</span>
			<p class="eyebrow">{vendor.industry} / {vendor.location}</p>
			<h2>
				<a href={resolve('/(public)/vendors/[slug]', { slug: vendor.slug })}>{vendor.name}</a>
			</h2>
			<p>{vendor.description.slice(0, 150)}{vendor.description.length > 150 ? '…' : ''}</p>
			<a class="text-link" href={resolve('/(public)/vendors/[slug]', { slug: vendor.slug })}
				>{vendor.activeJobCount} lowongan aktif ↗</a
			>
		</article>{:else}<div class="empty-state">
			<h2>Belum ada mitra yang sesuai.</h2>
			<p>Coba nama atau lokasi lain.</p>
		</div>{/each}
</div>
<div class="pagination">
	<span>Halaman {data.vendors.page} dari {Math.max(data.vendors.totalPages, 1)}</span>
	<div>
		{#if data.vendors.page > 1}<a class="button secondary" href={href(data.vendors.page - 1)}
				>← Sebelumnya</a
			>{/if}{#if data.vendors.page < data.vendors.totalPages}<a
				class="button secondary"
				href={href(data.vendors.page + 1)}>Berikutnya →</a
			>{/if}
	</div>
</div>
