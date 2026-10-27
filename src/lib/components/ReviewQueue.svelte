<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { cleanParams } from '#lib/marketplace/params.ts';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { createQuery } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import {
		statusLabel,
		type VendorPage,
		type JobPage,
		type Vendor,
		type Job
	} from '#lib/marketplace/types.ts';
	import StatusBadge from './StatusBadge.svelte';
	let { kind }: { kind: 'vendors' | 'jobs' } = $props();
	const session = useSession();
	const allowed = $derived(
		!!session.user?.permissions.includes(kind === 'vendors' ? 'vendor.verify' : 'job.moderate')
	);
	const params = $derived(cleanParams(page.url.searchParams));
	const list = createQuery(() => ({
		queryKey: ['admin', session.user?.id, kind, params.toString()],
		enabled: allowed,
		queryFn: ({ signal }) =>
			session.api.request<VendorPage | JobPage>('/admin/' + kind + '?' + params, { signal })
	}));
	const baseHref = $derived(
		kind === 'vendors'
			? resolve('/(app)/(protected)/admin/vendors')
			: resolve('/(app)/(protected)/admin/jobs')
	);
	function href(n: number) {
		const q = new SvelteURLSearchParams(params);
		q.set('page', String(n));
		return kind === 'vendors'
			? resolve(`/(app)/(protected)/admin/vendors?${q}`)
			: resolve(`/(app)/(protected)/admin/jobs?${q}`);
	}
	function detail(id: string) {
		return kind === 'vendors'
			? resolve('/(app)/(protected)/admin/vendors/[id]', { id })
			: resolve('/(app)/(protected)/admin/jobs/[id]', { id });
	}
</script>

<svelte:head
	><title>{kind === 'vendors' ? 'Clearance vendor' : 'Moderasi lowongan'} — Upstream</title
	></svelte:head
>
<div class="page-heading">
	<div>
		<p class="eyebrow">KEPERCAYAAN DIMULAI DARI KURASI</p>
		<h1>{kind === 'vendors' ? 'Clearance vendor.' : 'Moderasi lowongan.'}</h1>
		<p class="muted">
			{kind === 'vendors'
				? 'Periksa profil dan legalitas sebelum perusahaan menjadi mitra publik.'
				: 'Pastikan setiap peluang memenuhi standar platform sebelum tayang.'}
		</p>
	</div>
</div>
{#if !allowed}<p class="notice error" role="alert">
		Anda tidak memiliki akses untuk antrean ini.
	</p>{:else}<form class="filter-bar" method="GET" action={baseHref}>
		<input
			name="q"
			aria-label="Cari antrean review"
			placeholder="Cari nama atau posisi…"
			value={params.get('q') || ''}
		/><select name={kind === 'vendors' ? 'status' : 'moderationStatus'} aria-label="Status review"
			><option value="">Semua status</option
			>{#each kind === 'vendors' ? ['draft', 'pending', 'approved', 'revision_required', 'rejected', 'suspended'] : ['draft', 'pending', 'approved', 'revision_required', 'rejected'] as value (value)}<option
					{value}
					selected={params.get(kind === 'vendors' ? 'status' : 'moderationStatus') === value}
					>{statusLabel[value]}</option
				>{/each}</select
		><button class="button secondary">Terapkan</button><a class="text-link" href={baseHref}>Reset</a
		>
	</form>
	{#if list.isPending}<p class="notice" role="status">
			Memuat antrean review…
		</p>{:else if list.isError}<p class="notice error" role="alert">
			{errorMessage(list.error)}
			<button class="text-button" onclick={() => list.refetch()}>Coba kembali</button>
		</p>{:else if list.data}<section class="panel">
			<div class="table-scroll">
				<table class="business-table">
					<thead
						><tr
							><th>{kind === 'vendors' ? 'Perusahaan' : 'Posisi'}</th><th
								>{kind === 'vendors' ? 'Industri / lokasi' : 'Vendor'}</th
							><th>Status</th><th></th></tr
						></thead
					><tbody
						>{#each list.data.items as item (item.id)}{@const vendor = item as Vendor}{@const job =
								item as Job}<tr
								><td
									><strong>{kind === 'vendors' ? vendor.name : job.title}</strong><small
										>{kind === 'vendors' ? vendor.picEmail : job.location}</small
									></td
								><td
									>{kind === 'vendors'
										? vendor.industry + ' / ' + vendor.location
										: job.vendor.name}</td
								><td
									><StatusBadge
										status={kind === 'vendors' ? vendor.status : job.moderationStatus}
									/></td
								><td><a class="text-link" href={detail(item.id)}>Tinjau →</a></td></tr
							>{:else}<tr
								><td colspan="4"
									><div class="empty-state">
										<h2>Antrean bersih.</h2>
										<p>Belum ada data yang sesuai filter Anda.</p>
									</div></td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<div class="pagination">
				<span
					>{list.data.total} data · Halaman {list.data.page} dari {Math.max(
						list.data.totalPages,
						1
					)}</span
				>
				<div>
					{#if list.data.page > 1}<a class="button secondary" href={href(list.data.page - 1)}
							>← Sebelumnya</a
						>{/if}{#if list.data.page < list.data.totalPages}<a
							class="button secondary"
							href={href(list.data.page + 1)}>Berikutnya →</a
						>{/if}
				</div>
			</div>
		</section>{/if}{/if}
