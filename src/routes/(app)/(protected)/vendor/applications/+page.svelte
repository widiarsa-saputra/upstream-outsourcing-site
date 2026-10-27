<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { getLocalApplications, updateApplicationStage } from '#lib/candidate/application-store.ts';
	import {
		applicationStageConfig,
		type JobApplication,
		type ApplicationStage
	} from '#lib/candidate/applications.ts';

	const session = useSession();
	const queryClient = useQueryClient();

	const applicationsQuery = createQuery(() => ({
		queryKey: ['vendor', session.user?.id, 'applications'],
		enabled: !!session.user?.id,
		queryFn: async () => {
			const all = getLocalApplications();
			// Vendor hanya dapat melihat pelamar yang sudah masuk ke tahap minimal 'screening_internal' atau 'vendor_review'
			return all.filter((a) => !['withdrawn'].includes(a.stage));
		}
	}));

	let selectedApp = $state<JobApplication | null>(null);
	let transitionNotes = $state('');
	let scheduleInput = $state('');
	let filterStage = $state<string>('all');

	const filteredApps = $derived.by(() => {
		const list = applicationsQuery.data || [];
		if (filterStage === 'all') return list;
		return list.filter((a) => a.stage === filterStage);
	});

	function handleTransition(newStage: ApplicationStage) {
		if (!selectedApp) return;

		updateApplicationStage(
			selectedApp.id,
			newStage,
			session.user?.name || 'PIC Vendor',
			'VENDOR',
			transitionNotes.trim() || undefined,
			newStage === 'interview' ? scheduleInput.trim() || undefined : undefined
		);

		void queryClient.invalidateQueries({ queryKey: ['vendor', session.user?.id, 'applications'] });
		selectedApp = null;
		transitionNotes = '';
		scheduleInput = '';
	}

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
	<title>Pelamar & ATS Ringan — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">APPLICANT TRACKING SYSTEM (ATS)</p>
		<h1>Pelamar & <em>Kandidat Terkurasi.</em></h1>
		<p class="lead">
			Tinjau profil pelamar yang telah diverifikasi tim internal Upstream, jadwalkan wawancara, dan berikan penawaran kerja.
		</p>
	</div>
</div>

<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
	<button
		class="button small {filterStage === 'all' ? 'primary' : 'secondary'}"
		onclick={() => (filterStage = 'all')}
	>
		Semua ({applicationsQuery.data?.length || 0})
	</button>
	<button
		class="button small {filterStage === 'vendor_review' || filterStage === 'screening_internal' ? 'primary' : 'secondary'}"
		onclick={() => (filterStage = 'screening_internal')}
	>
		Review Kandidat ({applicationsQuery.data?.filter((a) => ['screening_internal', 'vendor_review'].includes(a.stage)).length || 0})
	</button>
	<button
		class="button small {filterStage === 'interview' ? 'primary' : 'secondary'}"
		onclick={() => (filterStage = 'interview')}
	>
		Wawancara ({applicationsQuery.data?.filter((a) => a.stage === 'interview').length || 0})
	</button>
	<button
		class="button small {filterStage === 'offered' || filterStage === 'hired' ? 'primary' : 'secondary'}"
		onclick={() => (filterStage = 'offered')}
	>
		Tawaran / Diterima ({applicationsQuery.data?.filter((a) => ['offered', 'hired'].includes(a.stage)).length || 0})
	</button>
</div>

{#if applicationsQuery.isPending}
	<div class="notice" role="status">Memuat data pelamar…</div>
{:else if filteredApps.length === 0}
	<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 32px; text-align: center;">
		<p class="muted" style="margin: 0; font-style: italic;">Belum ada pelamar pada tahapan seleksi ini.</p>
	</section>
{:else}
	<div style="display: flex; flex-direction: column; gap: 16px;">
		{#each filteredApps as app (app.id)}
			{@const stage = applicationStageConfig[app.stage]}
			<div
				class="panel"
				style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;"
			>
				<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
					<div>
						<div style="display: flex; align-items: baseline; gap: 8px;">
							<h2 style="font-size: 1.25rem; margin: 0; color: var(--green);">{app.candidateName}</h2>
							<span class="muted" style="font-size: 13px;">({app.candidateEmail})</span>
						</div>
						<p style="margin: 4px 0 0; font-weight: 600; color: var(--ink);">
							Posisi: {app.jobTitle}
						</p>
						<span class="muted" style="font-size: 12px;">Melamar pada {formatDate(app.appliedAt)}</span>
					</div>

					<div style="display: flex; align-items: center; gap: 10px;">
						<span
							style="display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
							{stage.tone === 'success' ? 'background: #dcfce7; color: #166534;' : ''}
							{stage.tone === 'info' ? 'background: #e0f2fe; color: #075985;' : ''}
							{stage.tone === 'pending' ? 'background: #fef9c3; color: #854d0e;' : ''}
							{stage.tone === 'danger' ? 'background: #fee2e2; color: #991b1b;' : ''}
							{stage.tone === 'neutral' ? 'background: #f1f5f9; color: #475569;' : ''}"
						>
							{stage.label}
						</span>
						<button class="button secondary small" onclick={() => (selectedApp = app)}>
							Kelola Seleksi ↗
						</button>
					</div>
				</div>

				{#if app.coverLetter}
					<div style="background: #fafbf9; padding: 12px 14px; border-radius: 8px; font-size: 13px; border: 1px solid var(--line);">
						<strong>Pesan Pelamar:</strong> "{app.coverLetter}"
					</div>
				{/if}

				{#if app.interviewSchedule}
					<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #14532d;">
						📅 <strong>Jadwal Interview:</strong> {app.interviewSchedule}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<!-- Modal Kelola & Mutasi Status Seleksi Pelamar -->
{#if selectedApp}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 100; padding: 16px;"
	>
		<div style="background: white; border-radius: 12px; width: 100%; max-width: 580px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
				<div>
					<span class="eyebrow" style="margin-bottom: 4px;">PENGAMBILAN KEPUTUSAN REKRUTMEN</span>
					<h3 style="margin: 0; color: var(--green);">{selectedApp.candidateName}</h3>
					<p class="muted" style="margin: 2px 0 0; font-size: 13px;">Untuk posisi: {selectedApp.jobTitle}</p>
				</div>
				<button
					onclick={() => (selectedApp = null)}
					style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;"
				>
					×
				</button>
			</div>

			<!-- Berkas Terlampir -->
			<div style="background: #f8faf6; border: 1px solid var(--line); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
				<h4 style="margin: 0 0 8px; font-size: 13px; color: var(--green); text-transform: uppercase;">
					Berkas Terverifikasi Pelamar
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px;">
					{#each selectedApp.documents as doc}
						<div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
							<span>📄 {doc.fileName} ({doc.documentType})</span>
							<button
								class="text-button"
								style="font-size: 12px;"
								onclick={() => alert(`Mengunduh dokumen aman ${doc.fileName} dengan token capability.`)}
							>
								Unduh Berkas ↗
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Jadwal Interview Input (Opsional jika mau panggil interview) -->
			<div style="margin-bottom: 14px;">
				<label for="sched" style="display: block; font-weight: 600; margin-bottom: 4px; font-size: 13px;">
					Jadwal & Lokasi Wawancara (Diisi jika panggil interview):
				</label>
				<input
					id="sched"
					type="text"
					placeholder="Contoh: Rabu, 30 Okt 2026, 10:00 WITA di Kantor Cabang Denpasar / Google Meet"
					bind:value={scheduleInput}
					style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-size: 13px;"
				/>
			</div>

			<!-- Catatan Tambahan -->
			<div style="margin-bottom: 20px;">
				<label for="notes" style="display: block; font-weight: 600; margin-bottom: 4px; font-size: 13px;">
					Catatan Rekrutmen / Umpan Balik:
				</label>
				<textarea
					id="notes"
					rows="2"
					placeholder="Catatan untuk tim atau pelamar..."
					bind:value={transitionNotes}
					style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-family: inherit; font-size: 13px;"
				></textarea>
			</div>

			<div style="display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
				<button class="button secondary small" onclick={() => (selectedApp = null)}>Batal</button>
				<button
					class="button small"
					style="background: #fee2e2; color: #991b1b; border: 1px solid #fecdd3;"
					onclick={() => handleTransition('rejected')}
				>
					Tolak Lamaran
				</button>
				<button
					class="button small secondary"
					onclick={() => handleTransition('interview')}
				>
					📅 Panggil Wawancara
				</button>
				<button
					class="button small"
					style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;"
					onclick={() => handleTransition('offered')}
				>
					Beri Penawaran (Offer)
				</button>
				<button
					class="button primary small"
					onclick={() => handleTransition('hired')}
				>
					✓ Terima & Salurkan (Hire)
				</button>
			</div>
		</div>
	</div>
{/if}
