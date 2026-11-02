<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import PublicJobCard from '#lib/components/PublicJobCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// State Opsi Tampilan: Grid & List (Modul: Publik: Halaman Layanan)
	let viewMode = $state<'grid' | 'list'>('grid');

	// Search filter query for location list
	let locationQuery = $state('');

	const allLocations = [
		'Kab Timor Tengah Selatan',
		'Kab. Aceh Barat',
		'Kab. Aceh Barat Daya',
		'Kab. Aceh Besar',
		'Kota Denpasar',
		'Kota Jakarta Selatan',
		'Kota Surabaya',
		'Kota Bandung',
		'Kab. Badung'
	];

	const visibleLocations = $derived(
		locationQuery.trim()
			? allLocations.filter((loc) => loc.toLowerCase().includes(locationQuery.trim().toLowerCase()))
			: allLocations
	);

	const hasActiveFilters = $derived(
		Boolean(
			data.filters.organizerType ||
			data.filters.degree ||
			data.filters.interviewType ||
			data.filters.location ||
			data.filters.type ||
			data.filters.q
		)
	);

	function href(n: number) {
		const q = new SvelteURLSearchParams(page.url.search);
		q.set('page', String(n));
		return resolve(`/(public)/layanan?${q}`);
	}
</script>

<svelte:head>
	<title>Katalog Program & Layanan Kerja — Go Career</title>
	<meta
		name="description"
		content="Jelajahi formasi dan program kerja alih daya dari mitra terverifikasi. Filter berdasarkan kategori bidang, pola kerja, dan rentang kompensasi."
	/>
</svelte:head>

<section class="public-hero compact" style="margin-bottom: 24px;">
	<div>
		<p class="eyebrow">KATALOG LAYANAN & PROGRAM KARIER</p>
		<h1>Temukan ruang<br />untuk <em>bertumbuh.</em></h1>
		<p>Peluang dan program terkurasi dari mitra industri yang telah melalui clearance legalitas resmi.</p>
	</div>
	<div class="hero-caption">
		<span>GO CAREER<br />HUB ↗</span><small>Peluang resmi. Arah baru.</small>
	</div>
</section>

<!-- Layout 2 Kolom: Left-Sidebar Filter Group + Main Catalog Area -->
<div style="display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap;">
	<!-- ==================== LEFT-SIDEBAR FILTER PROGRAM (Sesuai Referensi Gambar) ==================== -->
	<aside class="filter-card">
		<form method="GET" action={resolve('/(public)/layanan')}>
			<div class="filter-header">
				<div class="filter-title-wrap">
					<!-- Funnel Filter Icon matching image 2 -->
					<svg
						class="filter-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
					</svg>
					<h2 class="filter-title">Filter Lowongan</h2>
				</div>
				{#if hasActiveFilters}
					<a class="reset-link" href={resolve('/(public)/layanan')}>Reset</a>
				{/if}
			</div>

			<!-- Section 1: Tipe Penyelenggara -->
			<div class="filter-section">
				<span class="filter-section-title">Tipe Penyelenggara</span>
				<div class="filter-options">
					<label class="filter-radio-label">
						<input
							type="radio"
							name="organizerType"
							value="perusahaan"
							class="custom-radio"
							checked={data.filters.organizerType === 'perusahaan'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
						/>
						<span>Perusahaan</span>
					</label>
					<label class="filter-radio-label">
						<input
							type="radio"
							name="organizerType"
							value="kementerian"
							class="custom-radio"
							checked={data.filters.organizerType === 'kementerian'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
						/>
						<span>Kementerian / Lembaga</span>
					</label>
				</div>
			</div>

			<!-- Section 2: Jenjang -->
			<div class="filter-section">
				<span class="filter-section-title">Jenjang</span>
				<div class="filter-options">
					<label class="filter-radio-label">
						<input
							type="radio"
							name="degree"
							value="diploma"
							class="custom-radio"
							checked={data.filters.degree === 'diploma'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
						/>
						<span>Diploma</span>
					</label>
					<label class="filter-radio-label">
						<input
							type="radio"
							name="degree"
							value="sarjana"
							class="custom-radio"
							checked={data.filters.degree === 'sarjana'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
						/>
						<span>Sarjana</span>
					</label>
					<label class="filter-radio-label">
						<input
							type="radio"
							name="degree"
							value="profesi"
							class="custom-radio"
							checked={data.filters.degree === 'profesi'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
						/>
						<span>Profesi</span>
					</label>
				</div>
			</div>

			<!-- Section 3: Tipe Wawancara -->
			<div class="filter-section">
				<span class="filter-section-title">Tipe Wawancara</span>
				<div class="filter-options">
					<label class="filter-radio-label">
						<input
							type="radio"
							name="interviewType"
							value="onsite"
							class="custom-radio"
							checked={data.filters.interviewType === 'onsite'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
						/>
						<span>Tatap Muka (Onsite)</span>
					</label>
					<label class="filter-radio-label">
						<input
							type="radio"
							name="interviewType"
							value="online"
							class="custom-radio"
							checked={data.filters.interviewType === 'online'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
						/>
						<span>Daring (Online)</span>
					</label>
				</div>
			</div>

			<!-- Section 4: Lokasi -->
			<div class="filter-section">
				<span class="filter-section-title">Lokasi</span>
				<div class="location-search-wrap">
					<input
						type="text"
						placeholder="Cari lokasi kota"
						bind:value={locationQuery}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								(e.currentTarget.form as HTMLFormElement)?.requestSubmit();
							}
						}}
					/>
					<svg
						class="search-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
				</div>

				<div class="filter-options location-options">
					{#each visibleLocations as loc}
						<label class="filter-radio-label">
							<input
								type="radio"
								name="location"
								value={loc}
								class="custom-radio"
								checked={data.filters.location === loc}
								onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
							/>
							<span>{loc}</span>
						</label>
					{/each}
				</div>
			</div>

			{#if data.filters.type}
				<input type="hidden" name="type" value={data.filters.type} />
			{/if}
			{#if data.filters.q}
				<input type="hidden" name="q" value={data.filters.q} />
			{/if}
		</form>
	</aside>

	<!-- ==================== MAIN CONTENT: VIEW TOGGLE & JOBS ==================== -->
	<div style="flex: 1; min-width: 320px;">
		<!-- Baris Header Hasil & Tombol Pengubah Layout (Grid / List) -->
		<div
			class="results-heading"
			style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 14px; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 16px 20px;"
		>
			<div>
				<span class="eyebrow" style="margin-bottom: 2px; display: block;">KATALOG RESMI LAYANAN</span>
				<h2 style="font-size: 22px; margin: 0; color: var(--ink);">
					{data.jobs.total} program peluang tersedia
				</h2>
			</div>

			<!-- Fitur Mengubah Layout Tampilan: 2 Opsi (Grid dan List) -->
			<div style="display: flex; gap: 4px; align-items: center; background: #f1f5ee; border: 1px solid var(--line); border-radius: 8px; padding: 3px;">
				<button
					type="button"
					onclick={() => (viewMode = 'grid')}
					style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; {viewMode === 'grid' ? 'background: var(--green); color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : 'background: transparent; color: var(--muted);'}"
					title="Beralih ke Tampilan Grid"
				>
					⊞ Grid
				</button>
				<button
					type="button"
					onclick={() => (viewMode = 'list')}
					style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; {viewMode === 'list' ? 'background: var(--green); color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : 'background: transparent; color: var(--muted);'}"
					title="Beralih ke Tampilan List"
				>
					☰ List
				</button>
			</div>
		</div>

		<!-- Daftar Item Program Sesuai Opsi Tampilan -->
		{#if viewMode === 'grid'}
			<div class="public-job-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
				{#each data.jobs.items as job (job.id)}
					<PublicJobCard {job} viewMode="grid" />
				{:else}
					<div class="empty-state" style="grid-column: 1 / -1; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 48px; text-align: center;">
						<span style="font-size: 32px; display: block; margin-bottom: 8px;">🔍</span>
						<h3 style="margin: 0 0 8px;">Belum ada program yang sesuai kriteria.</h3>
						<p class="muted" style="margin: 0 0 16px;">Coba gunakan pilihan filter lainnya atau hapus filter.</p>
						<a class="button secondary" href={resolve('/(public)/layanan')}>Reset Semua Filter →</a>
					</div>
				{/each}
			</div>
		{:else}
			<div style="display: flex; flex-direction: column; gap: 14px;">
				{#each data.jobs.items as job (job.id)}
					<PublicJobCard {job} viewMode="list" />
				{:else}
					<div class="empty-state" style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 48px; text-align: center;">
						<span style="font-size: 32px; display: block; margin-bottom: 8px;">🔍</span>
						<h3 style="margin: 0 0 8px;">Belum ada program yang sesuai kriteria.</h3>
						<p class="muted" style="margin: 0 0 16px;">Coba gunakan pilihan filter lainnya atau hapus filter.</p>
						<a class="button secondary" href={resolve('/(public)/layanan')}>Reset Semua Filter →</a>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Navigasi Pagination -->
		{#if data.jobs.totalPages > 1}
			<div class="pagination" style="margin-top: 32px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--line); padding-top: 20px;">
				<span style="font-size: 13px; color: var(--muted);">
					Halaman {data.jobs.page} dari {data.jobs.totalPages}
				</span>
				<div style="display: flex; gap: 8px;">
					{#if data.jobs.page > 1}
						<a class="button secondary small" href={href(data.jobs.page - 1)}>← Sebelumnya</a>
					{/if}
					{#if data.jobs.page < data.jobs.totalPages}
						<a class="button secondary small" href={href(data.jobs.page + 1)}>Berikutnya →</a>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.filter-card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 24px 20px;
		width: 100%;
		max-width: 280px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
		flex-shrink: 0;
	}
	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}
	.filter-title-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.filter-icon {
		width: 18px;
		height: 18px;
		color: #0f172a;
	}
	.filter-title {
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
		margin: 0;
		letter-spacing: -0.2px;
	}
	.reset-link {
		font-size: 12px;
		color: #64748b;
		text-decoration: none;
		font-weight: 500;
	}
	.reset-link:hover {
		color: #2563eb;
		text-decoration: underline;
	}
	.filter-section {
		margin-top: 24px;
	}
	.filter-section:first-of-type {
		margin-top: 0;
	}
	.filter-section-title {
		font-size: 15px;
		font-weight: 600;
		color: #0f172a;
		margin-bottom: 14px;
		display: block;
	}
	.filter-options {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.filter-radio-label {
		display: flex !important;
		align-items: center;
		gap: 12px;
		font-size: 14.5px;
		font-weight: 400 !important;
		color: #1e293b;
		cursor: pointer;
		margin: 0 !important;
		user-select: none;
		line-height: 1.35;
	}
	.filter-radio-label:hover {
		color: #0f172a;
	}
	.custom-radio {
		appearance: none;
		-webkit-appearance: none;
		width: 18px !important;
		height: 18px !important;
		min-height: 18px !important;
		max-height: 18px !important;
		border: 1.5px solid #2563eb !important;
		border-radius: 50% !important;
		background-color: #ffffff !important;
		cursor: pointer;
		display: inline-grid;
		place-content: center;
		margin: 0 !important;
		padding: 0 !important;
		flex-shrink: 0;
		outline: none;
		transition: all 0.15s ease-in-out;
	}
	.custom-radio:checked::after {
		content: '';
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background-color: #2563eb;
	}
	.location-search-wrap {
		position: relative;
		margin-bottom: 14px;
	}
	.location-search-wrap input {
		width: 100% !important;
		border: 1px solid #cbd5e1 !important;
		border-radius: 8px !important;
		padding: 9px 38px 9px 14px !important;
		font-size: 14px !important;
		color: #1e293b !important;
		min-height: auto !important;
		margin-bottom: 0 !important;
		outline: none;
		background: #ffffff !important;
		transition: border-color 0.15s;
	}
	.location-search-wrap input:focus {
		border-color: #2563eb !important;
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
	}
	.search-icon {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		width: 18px;
		height: 18px;
		pointer-events: none;
		color: #64748b;
	}
	.location-options {
		max-height: 240px;
		overflow-y: auto;
		padding-right: 4px;
	}
	.location-options::-webkit-scrollbar {
		width: 4px;
	}
	.location-options::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 4px;
	}
</style>
