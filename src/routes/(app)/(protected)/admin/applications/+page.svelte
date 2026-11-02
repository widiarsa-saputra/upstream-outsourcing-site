<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import { downloadCandidateDocument } from '#lib/candidate/types.ts';
	import {
		applicationStageConfig,
		type Application,
		type ApplicationPage,
		type ApplicationStage,
		type ApplicationTransition
	} from '#lib/candidate/applications.ts';

	const session = useSession('admin');
	const queryClient = useQueryClient();
	const allowed = $derived(!!session.user?.permissions.includes('application.screen'));

	let filterStage = $state<string>('applied');
	let pageNumber = $state(1);

	const applicationsQuery = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'applications', filterStage, pageNumber],
		enabled: allowed,
		queryFn: ({ signal }) =>
			session.api.request<ApplicationPage>(
				`/admin/applications?page=${pageNumber}&pageSize=20${filterStage !== 'all' ? `&stage=${filterStage}` : ''}`,
				{ signal }
			)
	}));

	let selectedApp = $state<Application | null>(null);
	let screeningNotes = $state('');
	let internalNoteText = $state('');

	const transitionMutation = createMutation(() => ({
		mutationFn: ({ id, body }: { id: string; body: ApplicationTransition }) =>
			session.api.request<Application>(`/admin/applications/${id}/transitions`, {
				method: 'POST',
				body: JSON.stringify(body)
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['admin', session.user?.id, 'applications'] });
			selectedApp = null;
			screeningNotes = '';
		}
	}));

	const addNoteMutation = createMutation(() => ({
		mutationFn: ({ id, notes }: { id: string; notes: string }) =>
			session.api.request(`/admin/applications/${id}/notes`, {
				method: 'POST',
				body: JSON.stringify({ notes })
			}),
		onSuccess: async () => {
			if (selectedApp) {
				const fresh = await session.api.request<Application>(`/admin/applications/${selectedApp.id}`);
				selectedApp = fresh;
			}
			await queryClient.invalidateQueries({ queryKey: ['admin', session.user?.id, 'applications'] });
			internalNoteText = '';
		}
	}));

	function handleTransition(newStage: ApplicationStage) {
		if (!selectedApp) return;

		transitionMutation.mutate({
			id: selectedApp.id,
			body: {
				stage: newStage as any,
				notes: screeningNotes.trim() || undefined,
				version: selectedApp.version
			}
		});
	}

	function handleAddInternalNote() {
		if (!selectedApp || !internalNoteText.trim()) return;
		addNoteMutation.mutate({
			id: selectedApp.id,
			notes: internalNoteText.trim()
		});
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
	<title>Screening Lamaran — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">TALENT ACQUISITION & SCREENING</p>
		<h1>Screening & <em>Kurasi Lamaran.</em></h1>
		<p class="lead">
			Tinjau kelengkapan berkas kandidat yang melamar, tambahkan evaluasi internal tim, dan teruskan ke mitra vendor kerja.
		</p>
	</div>
</div>

{#if !allowed}
	<p class="notice error" role="alert">
		Anda tidak memiliki hak akses kurasi lamaran (memerlukan izin <code>application.screen</code>).
	</p>
{:else}
	<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
		<button
			class="button small {filterStage === 'applied' ? 'primary' : 'secondary'}"
			onclick={() => { filterStage = 'applied'; pageNumber = 1; }}
		>
			Perlu Screening Internal (Baru)
		</button>
		<button
			class="button small {filterStage === 'screening_internal' ? 'primary' : 'secondary'}"
			onclick={() => { filterStage = 'screening_internal'; pageNumber = 1; }}
		>
			Sedang Dikurasi
		</button>
		<button
			class="button small {filterStage === 'vendor_review' ? 'primary' : 'secondary'}"
			onclick={() => { filterStage = 'vendor_review'; pageNumber = 1; }}
		>
			Diteruskan ke Vendor
		</button>
		<button
			class="button small {filterStage === 'all' ? 'primary' : 'secondary'}"
			onclick={() => { filterStage = 'all'; pageNumber = 1; }}
		>
			Semua Tahapan
		</button>
	</div>

	{#if applicationsQuery.isPending}
		<div class="notice" role="status">Memuat data lamaran untuk screening dari backend…</div>
	{:else if applicationsQuery.isError}
		<div class="notice error" role="alert">{errorMessage(applicationsQuery.error)}</div>
	{:else if (applicationsQuery.data.items || []).length === 0}
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 32px; text-align: center;">
			<p class="muted" style="margin: 0; font-style: italic;">Tidak ada lamaran dalam antrean tahapan ini.</p>
		</section>
	{:else}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			{#each applicationsQuery.data.items as app (app.id)}
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
								Lowongan: {app.jobTitle} • <span class="muted">{app.vendorName}</span>
							</p>
							<span class="muted" style="font-size: 12px;">Diajukan: {formatDate(app.appliedAt)}</span>
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
								Kurasi & Evaluasi ↗
							</button>
						</div>
					</div>

					{#if app.coverLetter}
						<div style="background: #fafbf9; padding: 10px 14px; border-radius: 8px; font-size: 13px; border: 1px solid var(--line);">
							<strong>Pengantar:</strong> "{app.coverLetter}"
						</div>
					{/if}

					{#if (app.notes || []).length > 0}
						<div style="background: #fdfdfc; border-left: 3px solid var(--green); padding: 8px 12px; font-size: 13px;">
							<span class="muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700;">Catatan Internal Terakhir:</span>
							<p style="margin: 2px 0 0;">{app.notes![0].notes} <small class="muted">— {app.notes![0].actorName}</small></p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
{/if}

<!-- Modal Kurasi, Mutasi Tahap, dan Catatan Internal -->
{#if selectedApp}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 100; padding: 16px;"
	>
		<div style="background: white; border-radius: 12px; width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
				<div>
					<span class="eyebrow" style="margin-bottom: 4px;">KURASI INTERNAL STAF</span>
					<h3 style="margin: 0; color: var(--green);">{selectedApp.candidateName}</h3>
					<p class="muted" style="margin: 2px 0 0; font-size: 13px;">
						Melamar {selectedApp.jobTitle} di {selectedApp.vendorName}
					</p>
				</div>
				<button
					onclick={() => (selectedApp = null)}
					style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;"
				>
					×
				</button>
			</div>

			<!-- Snapshot Berkas Kandidat -->
			<div style="background: #f8faf6; border: 1px solid var(--line); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
				<h4 style="margin: 0 0 8px; font-size: 13px; color: var(--green); text-transform: uppercase;">
					Dokumen Terverifikasi dari Vault
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px;">
					{#each selectedApp.documents || [] as doc}
						<div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
							<span>📄 {doc.name} ({doc.documentType})</span>
							<button
								class="text-button"
								style="font-size: 12px;"
								onclick={() => downloadCandidateDocument(session.api, `/admin/applications/${selectedApp!.id}/documents/${doc.documentId}/download`, doc.name)}
							>
								Unduh & Periksa Berkas ↗
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Riwayat Catatan Internal Tim -->
			<div style="margin-bottom: 16px;">
				<h4 style="margin: 0 0 8px; font-size: 13px; color: var(--green); text-transform: uppercase;">
					Catatan Internal Evaluasi Staf
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; max-height: 140px; overflow-y: auto; margin-bottom: 10px;">
					{#if (selectedApp.notes || []).length === 0}
						<p class="muted" style="font-size: 12px; font-style: italic; margin: 0;">Belum ada catatan internal.</p>
					{:else}
						{#each selectedApp.notes || [] as note (note.id)}
							<div style="background: #fafbf9; border: 1px solid var(--line); border-radius: 6px; padding: 8px 12px; font-size: 13px;">
								<div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
									<strong style="color: var(--green);">{note.actorName}</strong>
									<span class="muted">{formatDateTime(note.createdAt)}</span>
								</div>
								<p style="margin: 0;">{note.notes}</p>
							</div>
						{/each}
					{/if}
				</div>

				<div style="display: flex; gap: 8px;">
					<input
						type="text"
						placeholder="Tulis evaluasi internal baru..."
						bind:value={internalNoteText}
						onkeydown={(e) => e.key === 'Enter' && handleAddInternalNote()}
						style="flex: 1; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-size: 13px;"
					/>
					<button
						class="button secondary small"
						disabled={addNoteMutation.isPending || !internalNoteText.trim()}
						onclick={handleAddInternalNote}
					>
						+ Simpan Catatan
					</button>
				</div>
			</div>

			<!-- Form Alasan / Catatan Transisi -->
			<div style="margin-bottom: 20px;">
				<label for="scr-notes" style="display: block; font-weight: 600; margin-bottom: 4px; font-size: 13px;">
					Umpan Balik Transisi Status:
				</label>
				<textarea
					id="scr-notes"
					rows="2"
					placeholder="Tulis alasan keputusan seleksi staf..."
					bind:value={screeningNotes}
					style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-family: inherit; font-size: 13px;"
				></textarea>
			</div>

			<!-- Aksi Transisi Status Kurasi -->
			<div style="display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
				<button class="button secondary small" onclick={() => (selectedApp = null)}>Tutup</button>
				<button
					class="button small"
					style="background: #fee2e2; color: #991b1b; border: 1px solid #fecdd3;"
					disabled={transitionMutation.isPending}
					onclick={() => handleTransition('rejected')}
				>
					Tolak Lamaran
				</button>
				{#if selectedApp.stage === 'applied'}
					<button
						class="button small secondary"
						disabled={transitionMutation.isPending}
						onclick={() => handleTransition('screening_internal')}
					>
						Mulai Screening Internal
					</button>
				{/if}
				<button
					class="button primary small"
					disabled={transitionMutation.isPending}
					onclick={() => handleTransition('vendor_review')}
				>
					{transitionMutation.isPending ? 'Memproses…' : '✓ Loloskan & Teruskan ke Vendor ↗'}
				</button>
			</div>
		</div>
	</div>
{/if}
