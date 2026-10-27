<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { cleanParams } from '#lib/marketplace/params.ts';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import { statusLabel, type JobPage } from '#lib/marketplace/types.ts';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	const session = useSession();
	const queries = useQueryClient();
	const params = $derived(cleanParams(page.url.searchParams));
	const jobs = createQuery(() => ({
		queryKey: ['vendor', session.user?.id, 'jobs', params.toString()],
		enabled: session.user?.role === 'VENDOR',
		queryFn: ({ signal }) => session.api.request<JobPage>('/vendor/jobs?' + params, { signal })
	}));
	const remove = createMutation(() => ({
		mutationFn: ({ id, version }: { id: string; version: number }) =>
			session.api.request('/vendor/jobs/' + id, {
				method: 'DELETE',
				body: JSON.stringify({ version })
			}),
		onSuccess: () => queries.invalidateQueries({ queryKey: ['vendor', session.user?.id] })
	}));
	function href(n: number) {
		const q = new SvelteURLSearchParams(params);
		q.set('page', String(n));
		return resolve(`/(app)/(protected)/vendor/jobs?${q}`);
	}
</script>

<svelte:head><title>Lowongan saya — Upstream</title></svelte:head>
<div class="page-heading">
	<div>
		<p class="eyebrow">TIM HEBAT DIMULAI DARI SEBUAH PELUANG</p>
		<h1>Lowongan saya.</h1>
		<p class="muted">Kelola draft, moderasi, dan penayangan lowongan perusahaan Anda.</p>
	</div>
	<a class="button" href={resolve('/(app)/(protected)/vendor/jobs/new')}>+ Buat lowongan</a>
</div>
<form class="filter-bar" method="GET" action={resolve('/(app)/(protected)/vendor/jobs')}>
	<input
		name="q"
		aria-label="Cari lowongan saya"
		placeholder="Cari posisi…"
		value={params.get('q') || ''}
	/><select name="moderationStatus" aria-label="Status moderasi"
		><option value="">Semua moderasi</option
		>{#each ['draft', 'pending', 'approved', 'revision_required', 'rejected'] as value (value)}<option
				{value}
				selected={params.get('moderationStatus') === value}>{statusLabel[value]}</option
			>{/each}</select
	><select name="publicationStatus" aria-label="Status penayangan"
		><option value="">Semua penayangan</option
		>{#each ['unpublished', 'published', 'paused', 'closed'] as value (value)}<option
				{value}
				selected={params.get('publicationStatus') === value}>{statusLabel[value]}</option
			>{/each}</select
	><button class="button secondary">Terapkan</button><a
		class="text-link"
		href={resolve('/(app)/(protected)/vendor/jobs')}>Reset</a
	>
</form>
{#if jobs.isPending}<p class="notice" role="status">Memuat lowongan…</p>{:else if jobs.isError}<p
		class="notice error"
		role="alert"
	>
		{errorMessage(jobs.error)}
		<button class="text-button" onclick={() => jobs.refetch()}>Coba kembali</button>
	</p>{:else if jobs.data}<section class="panel">
		<div class="table-scroll">
			<table class="business-table">
				<thead
					><tr><th>Posisi & lokasi</th><th>Moderasi</th><th>Penayangan</th><th>Aksi</th></tr></thead
				><tbody
					>{#each jobs.data.items as job (job.id)}<tr
							><td
								><a href={resolve('/(app)/(protected)/vendor/jobs/[id]', { id: job.id })}
									><strong>{job.title}</strong><small
										>{job.location} · {statusLabel[job.workMode]}</small
									></a
								></td
							><td><StatusBadge status={job.moderationStatus} /></td><td
								><StatusBadge status={job.publicationStatus} /></td
							><td
								><div class="inline-actions">
									<a
										class="text-link"
										href={resolve('/(app)/(protected)/vendor/jobs/[id]', { id: job.id })}
										>Kelola →</a
									>{#if job.moderationStatus === 'draft' && job.publicationStatus === 'unpublished'}<button
											class="text-button danger-text"
											disabled={remove.isPending}
											onclick={() => {
												if (confirm('Hapus draft lowongan ini?'))
													remove.mutate({ id: job.id, version: job.version });
											}}>Hapus</button
										>{/if}
								</div></td
							></tr
						>{:else}<tr
							><td colspan="4"
								><div class="empty-state">
									<h2>Belum ada lowongan di sini.</h2>
									<p>Mulai dari satu posisi untuk menemukan talenta yang tepat.</p>
								</div></td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>
		<div class="pagination">
			<span
				>{jobs.data.total} lowongan · Halaman {jobs.data.page} dari {Math.max(
					jobs.data.totalPages,
					1
				)}</span
			>
			<div>
				{#if jobs.data.page > 1}<a class="button secondary" href={href(jobs.data.page - 1)}
						>← Sebelumnya</a
					>{/if}{#if jobs.data.page < jobs.data.totalPages}<a
						class="button secondary"
						href={href(jobs.data.page + 1)}>Berikutnya →</a
					>{/if}
			</div>
		</div>
	</section>{/if}{#if remove.isError}<p class="notice error" role="alert">
		{errorMessage(remove.error)}
	</p>{/if}
