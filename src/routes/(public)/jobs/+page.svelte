<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import PublicJobCard from '#lib/components/PublicJobCard.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	function href(n: number) {
		const q = new SvelteURLSearchParams(page.url.search);
		q.set('page', String(n));
		return resolve(`/(public)/jobs?${q}`);
	}
</script>

<svelte:head
	><title>Temukan lowongan kerja — Upstream</title><meta
		name="description"
		content="Jelajahi peluang kerja dari mitra terverifikasi. Cari posisi berdasarkan lokasi, industri, pola kerja, dan rentang gaji."
	/></svelte:head
>
<section class="public-hero">
	<div>
		<p class="eyebrow">PELUANG BAIK, LANGKAH BERARTI</p>
		<h1>Temukan ruang<br />untuk <em>bertumbuh.</em></h1>
		<p>Lowongan terkurasi dari mitra yang telah melalui verifikasi.</p>
	</div>
	<div class="hero-caption">
		<span>YOUR NEXT<br />CHAPTER ↗</span><small>Karier Anda. Arah yang baru.</small>
	</div>
</section>
<form method="GET" action={resolve('/(public)/jobs')} class="job-search">
	<div class="search-primary">
		<label for="search-q">Posisi atau keahlian</label><input
			id="search-q"
			name="q"
			value={data.filters.q || ''}
			placeholder="Contoh: admin, operator gudang…"
		/><button class="button">Cari peluang ↗</button>
	</div>
	<div class="public-filters">
		<div>
			<label for="filter-location">Lokasi</label><input
				id="filter-location"
				name="location"
				value={data.filters.location || ''}
				placeholder="Semua kota"
			/>
		</div>
		<div>
			<label for="filter-industry">Industri</label><input
				id="filter-industry"
				name="industry"
				value={data.filters.industry || ''}
				placeholder="Semua industri"
			/>
		</div>
		<div>
			<label for="filter-mode">Pola kerja</label><select id="filter-mode" name="workMode"
				><option value="">Semua pola</option><option
					value="ONSITE"
					selected={data.filters.workMode === 'ONSITE'}>On-site</option
				><option value="REMOTE" selected={data.filters.workMode === 'REMOTE'}>Remote</option><option
					value="HYBRID"
					selected={data.filters.workMode === 'HYBRID'}>Hybrid</option
				></select
			>
		</div>
		<div>
			<label for="filter-vendor">Perusahaan</label><input
				id="filter-vendor"
				name="vendor"
				value={data.filters.vendor || ''}
				placeholder="Nama mitra"
			/>
		</div>
		<div>
			<label for="salary-from">Gaji mulai (IDR)</label><input
				id="salary-from"
				name="salaryMin"
				type="number"
				min="0"
				max="1000000000"
				value={data.filters.salaryMin || ''}
				placeholder="Minimum"
			/>
		</div>
		<div>
			<label for="salary-to">Gaji hingga (IDR)</label><input
				id="salary-to"
				name="salaryMax"
				type="number"
				min="0"
				max="1000000000"
				value={data.filters.salaryMax || ''}
				placeholder="Maksimum"
			/>
		</div>
		<div>
			<label for="salary-period-filter">Periode gaji</label><select
				id="salary-period-filter"
				name="salaryPeriod"
				><option value="">Semua periode</option><option
					value="MONTH"
					selected={data.filters.salaryPeriod === 'MONTH'}>Bulanan</option
				><option value="DAY" selected={data.filters.salaryPeriod === 'DAY'}>Harian</option></select
			>
		</div>
		<div>
			<label for="sort">Urutkan</label><select id="sort" name="sort"
				><option value="newest" selected={!data.filters.sort || data.filters.sort === 'newest'}
					>Terbaru</option
				><option value="oldest" selected={data.filters.sort === 'oldest'}>Terlama</option><option
					value="salary_desc"
					selected={data.filters.sort === 'salary_desc'}>Gaji terbuka tertinggi</option
				></select
			>
		</div>
	</div>
	{#if data.filters.vendorSlug}<input
			type="hidden"
			name="vendorSlug"
			value={data.filters.vendorSlug}
		/>{/if}
	<div class="search-footnote">
		<span>Pilih periode gaji untuk membandingkan nominal yang setara.</span><a
			class="text-link"
			href={resolve('/(public)/jobs')}>Reset filter</a
		>
	</div>
</form>
<div class="results-heading">
	<div>
		<p class="eyebrow">PILIH LANGKAH ANDA</p>
		<h2>{data.jobs.total} peluang menanti.</h2>
	</div>
	<span>Lowongan dari mitra terverifikasi</span>
</div>
<div class="public-job-grid">
	{#each data.jobs.items as job (job.id)}<PublicJobCard {job} />{:else}<div class="empty-state">
			<h2>Belum ada peluang yang sesuai.</h2>
			<p>Coba kata kunci atau lokasi lain. Peluang baru terus bertambah.</p>
			<a class="button secondary" href={resolve('/(public)/jobs')}>Lihat semua lowongan →</a>
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
