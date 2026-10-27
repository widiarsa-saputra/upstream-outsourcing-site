<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import { documentTypeLabels, type DocumentStatus } from '#lib/candidate/types.ts';

	const session = useSession();
	const queryClient = useQueryClient();
	const allowed = $derived(!!session.user?.permissions.includes('document.verify'));

	// Mock dokumen untuk antrean admin verifikasi
	interface ReviewItem {
		id: string;
		candidateId: string;
		candidateName: string;
		candidateEmail: string;
		documentType: string;
		fileName: string;
		fileSize: number;
		status: DocumentStatus;
		uploadedAt: string;
		reviewNotes?: string;
	}

	const initialReviews: ReviewItem[] = [
		{
			id: 'doc-rev-101',
			candidateId: 'cand-1',
			candidateName: 'Budi Santoso',
			candidateEmail: 'budi.santoso@example.com',
			documentType: 'ID_CARD',
			fileName: 'ktp_budi_santoso.jpg',
			fileSize: 1420000,
			status: 'pending_review',
			uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString()
		},
		{
			id: 'doc-rev-102',
			candidateId: 'cand-2',
			candidateName: 'Siti Rahmawati',
			candidateEmail: 'siti.rahma@example.com',
			documentType: 'RESUME',
			fileName: 'cv_siti_rahmawati_2026.pdf',
			fileSize: 850000,
			status: 'pending_review',
			uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString()
		},
		{
			id: 'doc-rev-103',
			candidateId: 'cand-3',
			candidateName: 'Made Aryawan',
			candidateEmail: 'made.aryawan@example.com',
			documentType: 'DIPLOMA',
			fileName: 'ijazah_s1_teknik_aryawan.pdf',
			fileSize: 2100000,
			status: 'pending_review',
			uploadedAt: new Date(Date.now() - 3600000 * 8).toISOString()
		}
	];

	let reviewItems = $state<ReviewItem[]>(initialReviews);
	let selectedDoc = $state<ReviewItem | null>(null);
	let reviewNotes = $state('');
	let filterStatus = $state<string>('pending_review');

	const filteredDocs = $derived.by(() => {
		if (filterStatus === 'all') return reviewItems;
		return reviewItems.filter((d) => d.status === filterStatus);
	});

	function openDecision(doc: ReviewItem) {
		selectedDoc = doc;
		reviewNotes = doc.reviewNotes || '';
	}

	function submitDecision(newStatus: 'verified' | 'revision_required' | 'rejected') {
		if (!selectedDoc) return;
		reviewItems = reviewItems.map((item) => {
			if (item.id === selectedDoc!.id) {
				return {
					...item,
					status: newStatus,
					reviewNotes: reviewNotes.trim() || undefined
				};
			}
			return item;
		});
		selectedDoc = null;
		reviewNotes = '';
	}

	function formatBytes(bytes: number) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function formatDate(iso: string) {
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
	<title>Verifikasi Dokumen Kandidat — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">TALENT ACQUISITION & COMPLIANCE</p>
		<h1>Verifikasi <em>Dokumen Kandidat.</em></h1>
		<p class="lead">
			Periksa keaslian KTP, Ijazah, dan CV kandidat sebelum diteruskan ke kurasi seleksi mitra vendor alih daya.
		</p>
	</div>
</div>

{#if !allowed}
	<p class="notice error" role="alert">
		Anda tidak memiliki hak akses verifikasi dokumen (memerlukan izin <code>document.verify</code>).
	</p>
{:else}
	<div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
		<span class="muted" style="font-weight: 600;">Filter Status:</span>
		<button
			class="button small {filterStatus === 'pending_review' ? 'primary' : 'secondary'}"
			onclick={() => (filterStatus = 'pending_review')}
		>
			Menunggu Verifikasi ({reviewItems.filter((d) => d.status === 'pending_review').length})
		</button>
		<button
			class="button small {filterStatus === 'verified' ? 'primary' : 'secondary'}"
			onclick={() => (filterStatus = 'verified')}
		>
			Terverifikasi ({reviewItems.filter((d) => d.status === 'verified').length})
		</button>
		<button
			class="button small {filterStatus === 'revision_required' ? 'primary' : 'secondary'}"
			onclick={() => (filterStatus = 'revision_required')}
		>
			Perlu Revisi ({reviewItems.filter((d) => d.status === 'revision_required').length})
		</button>
		<button
			class="button small {filterStatus === 'all' ? 'primary' : 'secondary'}"
			onclick={() => (filterStatus = 'all')}
		>
			Semua ({reviewItems.length})
		</button>
	</div>

	<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 20px;">
		{#if filteredDocs.length === 0}
			<p class="muted" style="padding: 24px 0; text-align: center; font-style: italic;">
				Tidak ada dokumen dalam status ini.
			</p>
		{:else}
			<div class="table-scroll">
				<table>
					<thead>
						<tr>
							<th>Kandidat</th>
							<th>Jenis Dokumen</th>
							<th>Nama File / Ukuran</th>
							<th>Waktu Unggah</th>
							<th>Status</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredDocs as item (item.id)}
							{@const docConf = documentTypeLabels[item.documentType as keyof typeof documentTypeLabels]}
							<tr>
								<td>
									<strong>{item.candidateName}</strong>
									<br />
									<small class="muted">{item.candidateEmail}</small>
								</td>
								<td>
									<strong>{docConf?.label || item.documentType}</strong>
								</td>
								<td>
									<span>{item.fileName}</span>
									<br />
									<small class="muted">{formatBytes(item.fileSize)}</small>
								</td>
								<td>
									<small>{formatDate(item.uploadedAt)}</small>
								</td>
								<td>
									<span
										style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px;
										{item.status === 'verified' ? 'background: #dcfce7; color: #166534;' : ''}
										{item.status === 'pending_review' ? 'background: #fef9c3; color: #854d0e;' : ''}
										{item.status === 'revision_required' ? 'background: #fee2e2; color: #991b1b;' : ''}
										{item.status === 'rejected' ? 'background: #f1f5f9; color: #475569;' : ''}"
									>
										{item.status === 'verified'
											? 'Terverifikasi'
											: item.status === 'pending_review'
												? 'Menunggu review'
												: item.status === 'revision_required'
													? 'Perlu revisi'
													: 'Ditolak'}
									</span>
								</td>
								<td>
									<button class="button secondary small" onclick={() => openDecision(item)}>
										Periksa Berkas ↗
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
{/if}

<!-- Modal Periksa & Putusan Dokumen -->
{#if selectedDoc}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 100; padding: 16px;"
	>
		<div style="background: white; border-radius: 12px; width: 100%; max-width: 580px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
				<div>
					<span class="eyebrow" style="margin-bottom: 4px;">REVIEW KEABSAHAN DOKUMEN</span>
					<h3 style="margin: 0; color: var(--green);">{selectedDoc.candidateName}</h3>
					<p class="muted" style="margin: 2px 0 0; font-size: 13px;">{selectedDoc.fileName} ({formatBytes(selectedDoc.fileSize)})</p>
				</div>
				<button
					onclick={() => (selectedDoc = null)}
					style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;"
				>
					×
				</button>
			</div>

			<div style="background: #f8faf6; border: 1px solid var(--line); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<span style="font-weight: 600; font-size: 14px; color: var(--green);">Pratinjau Dokumen Bertanda Tangan:</span>
					<a
						class="button secondary small"
						href="#preview"
						onclick={(e) => {
							e.preventDefault();
							alert('Membuka file aman ' + selectedDoc!.fileName + ' dengan presigned URL.');
						}}
					>
						Unduh / Lihat File ↗
					</a>
				</div>
				<p class="muted" style="font-size: 12px; margin: 8px 0 0;">
					File ini diunduh secara terenkripsi menggunakan ephemeral bearer token (masa berlaku 60 detik).
				</p>
			</div>

			<div style="margin-bottom: 20px;">
				<label for="review-notes" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px;">
					Catatan Verifikasi (Wajib diisi jika minta revisi / ditolak):
				</label>
				<textarea
					id="review-notes"
					rows="3"
					placeholder="Tuliskan alasan revisi, misalnya: Foto KTP buram dan terpotong, mohon unggah ulang dengan pencahayaan terang..."
					bind:value={reviewNotes}
					style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit; font-size: 14px;"
				></textarea>
			</div>

			<div style="display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
				<button class="button secondary small" onclick={() => (selectedDoc = null)}>Batal</button>
				<button
					class="button small"
					style="background: #fee2e2; color: #991b1b; border: 1px solid #fecdd3;"
					onclick={() => submitDecision('revision_required')}
				>
					Minta Revisi
				</button>
				<button
					class="button primary small"
					style="background: var(--green); color: white;"
					onclick={() => submitDecision('verified')}
				>
					Verifikasi & Loloskan (Approve)
				</button>
			</div>
		</div>
	</div>
{/if}
