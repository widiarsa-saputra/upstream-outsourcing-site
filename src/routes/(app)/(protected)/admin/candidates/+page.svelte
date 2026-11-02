<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { CandidatePage } from '#lib/candidate/types.ts';

	const session = useSession('admin');
	const allowed = $derived(!!session.user?.permissions.includes('document.verify'));

	let search = $state('');
	let pageNumber = $state(1);

	const candidatesQuery = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'candidates', search, pageNumber],
		enabled: allowed,
		queryFn: ({ signal }) =>
			session.api.request<CandidatePage>(
				`/admin/candidates?page=${pageNumber}&pageSize=20${search ? `&search=${encodeURIComponent(search)}` : ''}`,
				{ signal }
			)
	}));
</script>

<svelte:head>
	<title>Direktori Talenta — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">TALENT ACQUISITION POOL</p>
		<h1>Direktori <em>Talenta & Kandidat.</em></h1>
		<p class="lead">
			Daftar kandidat yang telah mendaftar, melengkapi CV digital, dan terdata di backend sistem Upstream.
		</p>
	</div>
</div>

{#if !allowed}
	<p class="notice error" role="alert">
		Anda tidak memiliki hak akses kurasi talenta (memerlukan izin <code>document.verify</code>).
	</p>
{:else}
	<div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
		<input
			type="search"
			placeholder="Cari berdasarkan nama atau kata kunci..."
			bind:value={search}
			style="flex: 1; min-width: 260px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; background: white;"
		/>
	</div>

	{#if candidatesQuery.isPending}
		<div class="notice" role="status">Memuat direktori kandidat dari backend API…</div>
	{:else if candidatesQuery.isError}
		<div class="notice error" role="alert">{errorMessage(candidatesQuery.error)}</div>
	{:else if (candidatesQuery.data.items || []).length === 0}
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 32px; text-align: center;">
			<p class="muted" style="margin: 0; font-style: italic;">Belum ada kandidat yang terdaftar.</p>
		</section>
	{:else}
		<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
			{#each candidatesQuery.data.items as cand (cand.id)}
				<div class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
					<div>
						<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
							<div>
								<h2 style="font-size: 1.2rem; margin: 0; color: var(--green);">{cand.name}</h2>
								<p class="muted" style="font-size: 13px; margin: 2px 0 0;">{cand.email}</p>
							</div>
							<span
								style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px;
								{cand.verifiedDocumentCount > 0 ? 'background: #dcfce7; color: #166534;' : 'background: #fef9c3; color: #854d0e;'}"
							>
								{cand.verifiedDocumentCount} Terverifikasi
							</span>
						</div>

						<p style="font-weight: 600; color: var(--ink); margin: 6px 0 2px; font-size: 14px;">
							{cand.headline || 'Belum mengisi headline'}
						</p>
						<p class="muted" style="font-size: 13px; margin: 0 0 14px;">
							📍 {cand.location || 'Lokasi belum diisi'}
						</p>
					</div>

					<div style="border-top: 1px solid var(--line); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
						<span class="muted" style="font-size: 12px;">{cand.activeDocumentCount} dokumen di vault</span>
						<a
							class="button secondary small"
							href={resolve('/(app)/(protected)/admin/documents')}
						>
							Tinjau Berkas ↗
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}
