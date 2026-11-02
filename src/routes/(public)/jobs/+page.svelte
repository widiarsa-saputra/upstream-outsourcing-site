<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import PublicJobCard from '#lib/components/PublicJobCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// State Opsi Tampilan: Grid & List (Modul: Publik: Halaman Layanan)
	let viewMode = $state<'grid' | 'list'>('grid');

	function href(n: number) {
		const q = new SvelteURLSearchParams(page.url.search);
		q.set('page', String(n));
		return resolve(`/(public)/jobs?${q}`);
	}
</script>

<svelte:head>
	<title>Katalog Program & Layanan Kerja — Go Career / Upstream</title>
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
	<!-- ==================== LEFT-SIDEBAR FILTER PROGRAM ==================== -->
	<aside
		class="jobs-left-sidebar"
		style="width: 100%; max-width: 290px; background: white; border: 1px solid var(--line); border-radius: 14px; padding: 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.02);"
	>
		<form method="GET" action={resolve('/(public)/jobs')}>
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
				<strong style="font-size: 14px; color: var(--ink); text-transform: uppercase; letter-spacing: 0.5px;">
					🔍 Filter Program
				</strong>
				<a class="text-link" href={resolve('/(public)/jobs')} style="font-size: 11px; color: var(--muted);">
					Reset
				</a>
			</div>

			<!-- Search Keyword Input -->
			<div style="margin-bottom: 20px;">
				<label for="search-q" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px;">
					Nama Posisi / Program
				</label>
				<input
					id="search-q"
					name="q"
					value={data.filters.q || ''}
					placeholder="Contoh: IT, logistik, admin…"
					style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px; font-size: 13px;"
				/>
			</div>

			<!-- Keyword Group 1: Kategori & Bidang Industri -->
			<div style="margin-bottom: 22px; border-top: 1px solid var(--line); padding-top: 14px;">
				<span style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px;">
					🏷️ Bidang / Sektor
				</span>
				<div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
					{#each [
						{ label: 'Semua Bidang', val: '' },
						{ label: 'Teknologi Informasi', val: 'Teknologi Informasi' },
						{ label: 'Logistik & Rantai Pasok', val: 'Logistik' },
						{ label: 'Manufaktur & Pabrik', val: 'Manufaktur' },
						{ label: 'Layanan & Perhotelan', val: 'Perhotelan' },
						{ label: 'Administrasi Bisnis', val: 'Administrasi' }
					] as item}
						<label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #374151;">
							<input
								type="radio"
								name="industry"
								value={item.val}
								checked={(data.filters.industry || '') === item.val}
								onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
							/>
							<span>{item.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Keyword Group 2: Pola Kerja (Work Mode) -->
			<div style="margin-bottom: 22px; border-top: 1px solid var(--line); padding-top: 14px;">
				<span style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px;">
					💼 Pola Kerja
				</span>
				<div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
					{#each [
						{ label: 'Semua Pola', val: '' },
						{ label: 'On-site (Di Kantor/Lokasi)', val: 'ONSITE' },
						{ label: 'Remote (Jarak Jauh)', val: 'REMOTE' },
						{ label: 'Hybrid', val: 'HYBRID' }
					] as mode}
						<label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #374151;">
							<input
								type="radio"
								name="workMode"
								value={mode.val}
								checked={(data.filters.workMode || '') === mode.val}
								onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
							/>
							<span>{mode.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Keyword Group 3: Lokasi & Perusahaan -->
			<div style="margin-bottom: 22px; border-top: 1px solid var(--line); padding-top: 14px;">
				<span style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px;">
					📍 Lokasi & Kota
				</span>
				<input
					id="filter-location"
					name="location"
					value={data.filters.location || ''}
					placeholder="Contoh: Denpasar, Jakarta…"
					style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; font-size: 12px; margin-bottom: 10px;"
				/>

				<span style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px;">
					🏢 Nama Mitra
				</span>
				<input
					id="filter-vendor"
					name="vendor"
					value={data.filters.vendor || ''}
					placeholder="Nama perusahaan…"
					style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; font-size: 12px;"
				/>
			</div>

			<!-- Urutan -->
			<div style="margin-bottom: 20px; border-top: 1px solid var(--line); padding-top: 14px;">
				<label for="sort-select" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px; text-transform: uppercase;">
					Urutan
				</label>
				<select
					id="sort-select"
					name="sort"
					style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; font-size: 12px; background: white;"
					onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
				>
					<option value="newest" selected={!data.filters.sort || data.filters.sort === 'newest'}>Terbaru</option>
					<option value="oldest" selected={data.filters.sort === 'oldest'}>Terlama</option>
					<option value="salary_desc" selected={data.filters.sort === 'salary_desc'}>Gaji Tertinggi</option>
				</select>
			</div>

			{#if data.filters.vendorSlug}
				<input type="hidden" name="vendorSlug" value={data.filters.vendorSlug} />
			{/if}

			<button
				type="submit"
				class="button primary full"
				style="font-size: 12px; padding: 9px 14px; justify-content: center;"
			>
				Terapkan Filter ↗
			</button>
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
				<span class="eyebrow" style="margin-bottom: 2px; display: block;">KATALOG RESMI</span>
				<h2 style="font-size: 22px; margin: 0; color: var(--ink);">
					{data.jobs.total} formasi program tersedia
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
						<h3 style="margin: 0 0 8px;">Belum ada peluang yang sesuai kriteria.</h3>
						<p class="muted" style="margin: 0 0 16px;">Coba gunakan kata kunci atau pilihan filter bidang lainnya.</p>
						<a class="button secondary" href={resolve('/(public)/jobs')}>Reset Semua Filter →</a>
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
						<h3 style="margin: 0 0 8px;">Belum ada peluang yang sesuai kriteria.</h3>
						<p class="muted" style="margin: 0 0 16px;">Coba gunakan kata kunci atau pilihan filter bidang lainnya.</p>
						<a class="button secondary" href={resolve('/(public)/jobs')}>Reset Semua Filter →</a>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Navigasi Pagination -->
		<div class="pagination" style="margin-top: 32px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--line); padding-top: 20px;">
			<span style="font-size: 13px; color: var(--muted);">
				Halaman {data.jobs.page} dari {Math.max(data.jobs.totalPages, 1)}
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
	</div>
</div>
