<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { Vendor } from '#lib/marketplace/types.ts';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import LegalDocuments from '#lib/components/LegalDocuments.svelte';
	import ReviewDecision from '#lib/components/ReviewDecision.svelte';
	import ReviewHistory from '#lib/components/ReviewHistory.svelte';
	const session = useSession('admin');
	const allowed = $derived(!!session.user?.permissions.includes('vendor.verify'));
	const vendor = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'vendors', 'detail', page.params.id],
		enabled: allowed,
		queryFn: ({ signal }) =>
			session.api.request<Vendor>('/admin/vendors/' + page.params.id, { signal })
	}));
</script>

<svelte:head><title>{vendor.data?.name || 'Clearance vendor'} — Upstream</title></svelte:head>
{#if !allowed}<p class="notice error" role="alert">
		Anda tidak memiliki akses clearance vendor.
	</p>{:else if vendor.isPending}<p class="notice" role="status">
		Memuat vendor…
	</p>{:else if vendor.isError}<p class="notice error" role="alert">
		{errorMessage(vendor.error)}
	</p>{:else if vendor.data}{@const v = vendor.data}
	<div class="page-heading">
		<div>
			<p class="eyebrow">CLEARANCE MITRA USAHA</p>
			<h1>{v.name}</h1>
			<StatusBadge status={v.status} />
		</div>
	</div>
	<div class="review-layout">
		<div>
			<section class="panel">
				<h2>Profil & legalitas.</h2>
				<p class="preserve-lines">{v.description}</p>
				<dl class="detail-grid">
					<div>
						<dt>Industri / lokasi</dt>
						<dd>{v.industry} / {v.location}</dd>
					</div>
					<div>
						<dt>Alamat legal</dt>
						<dd>{v.address || 'Belum diisi'}</dd>
					</div>
					<div>
						<dt>Website</dt>
						<dd>{v.website || 'Belum diisi'}</dd>
					</div>
					<div>
						<dt>Nomor NPWP</dt>
						<dd>{v.npwp || 'Belum diisi'}</dd>
					</div>
					<div>
						<dt>Nomor NIB</dt>
						<dd>{v.nib || 'Belum diisi'}</dd>
					</div>
					<div>
						<dt>PIC</dt>
						<dd>{v.picName} · {v.picPhone}<br />{v.picEmail}</dd>
					</div>
				</dl>
			</section>
			<LegalDocuments vendor={v} readonly />
			<section class="panel"><ReviewHistory reviews={v.reviews} /></section>
		</div>
		{#key v.version}<ReviewDecision
				kind="vendors"
				id={v.id}
				version={v.version}
				status={v.status}
			/>{/key}
	</div>{/if}
