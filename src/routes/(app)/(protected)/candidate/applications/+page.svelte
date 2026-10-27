<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import {
		applicationStageConfig,
		type Application
	} from '#lib/candidate/applications.ts';

	const session = useSession();
	const queryClient = useQueryClient();

	const applicationsQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'applications'],
		enabled: !!session.user?.id,
		queryFn: ({ signal }) =>
			session.api.request<Application[]>('/candidate/applications', { signal })
	}));

	const withdrawMutation = createMutation(() => ({
		mutationFn: (id: string) =>
			session.api.request<Application>(`/candidate/applications/${id}/withdraw`, {
				method: 'POST'
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'applications'] });
		}
	}));

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatDateTime(iso: string) {
		return new Date(iso).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Lamaran Saya — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">APPLICATION TRACKER & STATUS</p>
		<h1>Riwayat & <em>Status Lamaran.</em></h1>
		<p class="lead">
			Pantau perkembangan kurasi berkas oleh tim internal dan undangan wawancara kerja dari mitra perusahaan langsung dari backend.
		</p>
	</div>
</div>

{#if applicationsQuery.isPending}
	<div class="notice" role="status">Memuat daftar lamaran Anda dari backend…</div>
{:else if applicationsQuery.isError}
	<div class="notice error" role="alert">{errorMessage(applicationsQuery.error)}</div>
{:else if (applicationsQuery.data || []).length === 0}
	<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 40px; text-align: center;">
		<h2 style="font-size: 1.5rem; color: var(--green); margin-bottom: 8px;">Belum Ada Lamaran Aktif</h2>
		<p class="muted" style="max-width: 480px; margin: 0 auto 24px;">
			Anda belum melamar pekerjaan apa pun. Jelajahi lowongan alih daya yang tersedia dan kirimkan CV digital Anda.
		</p>
		<a class="button primary" href={resolve('/(public)/jobs')}>
			Jelajahi Lowongan Kerja Sekarang ↗
		</a>
	</section>
{:else}
	<div style="display: flex; flex-direction: column; gap: 20px;">
		{#each applicationsQuery.data || [] as app (app.id)}
			{@const stageInfo = applicationStageConfig[app.stage]}
			<section
				class="panel"
				style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px;"
			>
				<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
					<div>
						<span class="eyebrow" style="margin-bottom: 4px;">{app.vendorName}</span>
						<h2 style="font-size: 1.4rem; margin: 0; color: var(--green);">{app.jobTitle}</h2>
						<p class="muted" style="font-size: 13px; margin: 4px 0 0;">
							📍 {app.vendorLocation} • Diajukan pada {formatDate(app.appliedAt)}
						</p>
					</div>

					<div style="text-align: right;">
						<span
							style="display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px;
							{stageInfo.tone === 'success' ? 'background: #dcfce7; color: #166534;' : ''}
							{stageInfo.tone === 'info' ? 'background: #e0f2fe; color: #075985;' : ''}
							{stageInfo.tone === 'pending' ? 'background: #fef9c3; color: #854d0e;' : ''}
							{stageInfo.tone === 'danger' ? 'background: #fee2e2; color: #991b1b;' : ''}
							{stageInfo.tone === 'neutral' ? 'background: #f1f5f9; color: #475569;' : ''}"
						>
							{stageInfo.label}
						</span>
						<p class="muted" style="font-size: 12px; margin: 6px 0 0;">{stageInfo.description}</p>
					</div>
				</div>

				{#if app.interviewSchedule}
					<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px;">
						<strong style="color: #166534; font-size: 14px;">📅 Jadwal Wawancara:</strong>
						<p style="margin: 4px 0 0; color: #14532d; font-size: 14px;">{app.interviewSchedule}</p>
					</div>
				{/if}

				<!-- Riwayat Tahapan dari backend events -->
				<div style="background: #fafbf9; border-radius: 8px; padding: 16px; border: 1px solid var(--line);">
					<h3 style="margin: 0 0 12px; font-size: 13px; color: var(--green); text-transform: uppercase; letter-spacing: 1px;">
						Histori Perkembangan Seleksi
					</h3>
					<div style="display: flex; flex-direction: column; gap: 10px;">
						{#each app.events || [] as h (h.id)}
							<div style="display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px solid #edf1e8; padding-bottom: 6px;">
								<div>
									<strong style="color: var(--ink);">{applicationStageConfig[h.stage]?.label || h.stage}</strong>
									{#if h.notes}
										<span class="muted" style="display: block; font-size: 12px; margin-top: 2px;">{h.notes}</span>
									{/if}
								</div>
								<span class="muted" style="white-space: nowrap; font-size: 12px;">{formatDateTime(h.createdAt)}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Aksi Batalkan jika masih aktif -->
				{#if !['withdrawn', 'rejected', 'hired'].includes(app.stage)}
					<div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid #edf1e8; padding-top: 12px;">
						<button
							class="text-button"
							style="color: #b91c1c; font-size: 13px;"
							disabled={withdrawMutation.isPending}
							onclick={() => {
								if (confirm(`Apakah Anda yakin ingin membatalkan lamaran untuk posisi ${app.jobTitle}?`)) {
									withdrawMutation.mutate(app.id);
								}
							}}
						>
							{withdrawMutation.isPending ? 'Membatalkan…' : 'Tarik / Batalkan Lamaran'}
						</button>
					</div>
				{/if}
			</section>
		{/each}
	</div>
{/if}
