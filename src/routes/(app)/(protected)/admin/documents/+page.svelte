<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import {
		candidateDocumentLabels,
		downloadCandidateDocument,
		type CandidateDocumentPage,
		type CandidateDocumentItem,
		type CandidateDocumentReview
	} from '#lib/candidate/types.ts';

	const session = useSession('admin');
	const queryClient = useQueryClient();
	const allowed = $derived(!!session.user?.permissions.includes('document.verify'));

	let filterStatus = $state<string>('pending');
	let pageNumber = $state(1);

	const documentsQuery = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'candidate-documents', filterStatus, pageNumber],
		enabled: allowed,
		queryFn: ({ signal }) =>
			session.api.request<CandidateDocumentPage>(
				`/admin/candidate-documents?page=${pageNumber}&pageSize=20${filterStatus !== 'all' ? `&verificationStatus=${filterStatus}` : ''}`,
				{ signal }
			)
	}));

	let selectedDoc = $state<CandidateDocumentItem | null>(null);
	let reviewReason = $state('');

	const reviewMutation = createMutation(() => ({
		mutationFn: ({ id, body }: { id: string; body: CandidateDocumentReview }) =>
			session.api.request(`/admin/candidate-documents/${id}/reviews`, {
				method: 'POST',
				body: JSON.stringify(body)
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['admin', session.user?.id, 'candidate-documents'] });
			selectedDoc = null;
			reviewReason = '';
		}
	}));

	function openDecision(doc: CandidateDocumentItem) {
		selectedDoc = doc;
		reviewReason = doc.reviewReason || '';
	}

	function submitDecision(decision: 'verified' | 'revision_required' | 'rejected') {
		if (!selectedDoc) return;
		reviewMutation.mutate({
			id: selectedDoc.id,
			body: {
				decision,
				reason: reviewReason.trim()
			}
		});
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
			Periksa keaslian KTP, Ijazah, dan CV kandidat langsung dari storage backend sebelum diteruskan ke kurasi seleksi mitra vendor alih daya.
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
			class="button small {filterStatus === 'pending' ? 'primary' : 'secondary'}"
			onclick={() => { filterStatus = 'pending'; pageNumber = 1; }}
		>
			Menunggu Verifikasi
		</button>
		<button
			class="button small {filterStatus === 'verified' ? 'primary' : 'secondary'}"
			onclick={() => { filterStatus = 'verified'; pageNumber = 1; }}
		>
			Terverifikasi
		</button>
		<button
			class="button small {filterStatus === 'revision_required' ? 'primary' : 'secondary'}"
			onclick={() => { filterStatus = 'revision_required'; pageNumber = 1; }}
		>
			Perlu Revisi
		</button>
		<button
			class="button small {filterStatus === 'all' ? 'primary' : 'secondary'}"
			onclick={() => { filterStatus = 'all'; pageNumber = 1; }}
		>
			Semua
		</button>
	</div>

	{#if documentsQuery.isPending}
		<div class="notice" role="status">Memuat data antrean verifikasi dari backend API…</div>
	{:else if documentsQuery.isError}
		<div class="notice error" role="alert">{errorMessage(documentsQuery.error)}</div>
	{:else if (documentsQuery.data.items || []).length === 0}
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 32px; text-align: center;">
			<p class="muted" style="margin: 0; font-style: italic;">Tidak ada dokumen dalam status ini.</p>
		</section>
	{:else}
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 20px;">
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
						{#each documentsQuery.data.items as item (item.id)}
							{@const docConf = candidateDocumentLabels[item.type]}
							<tr>
								<td>
									<strong>{item.candidateName}</strong>
									<br />
									<small class="muted">{item.candidateEmail}</small>
								</td>
								<td>
									<strong>{docConf?.label || item.type}</strong>
								</td>
								<td>
									<span>{item.name}</span>
									<br />
									<small class="muted">{formatBytes(item.size)}</small>
								</td>
								<td>
									<small>{formatDate(item.createdAt)}</small>
								</td>
								<td>
									<span
										style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px;
										{item.verificationStatus === 'verified' ? 'background: #dcfce7; color: #166534;' : ''}
										{item.verificationStatus === 'pending' ? 'background: #fef9c3; color: #854d0e;' : ''}
										{item.verificationStatus === 'revision_required' ? 'background: #fee2e2; color: #991b1b;' : ''}
										{item.verificationStatus === 'rejected' ? 'background: #f1f5f9; color: #475569;' : ''}"
									>
										{item.verificationStatus === 'verified'
											? 'Terverifikasi'
											: item.verificationStatus === 'pending'
												? 'Menunggu review'
												: item.verificationStatus === 'revision_required'
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
		</section>
	{/if}
{/if}

<!-- Modal Periksa & Putusan Dokumen dari Backend -->
{#if selectedDoc}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 100; padding: 16px;"
	>
		<div style="background: white; border-radius: 12px; width: 100%; max-width: 580px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
				<div>
					<span class="eyebrow" style="margin-bottom: 4px;">REVIEW KEABSAHAN DOKUMEN</span>
					<h3 style="margin: 0; color: var(--green);">{selectedDoc.candidateName}</h3>
					<p class="muted" style="margin: 2px 0 0; font-size: 13px;">{selectedDoc.name} ({formatBytes(selectedDoc.size)})</p>
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
					<span style="font-weight: 600; font-size: 14px; color: var(--green);">Unduh Dokumen Asli Backend:</span>
					<button
						class="button secondary small"
						onclick={() => downloadCandidateDocument(session.api, `/admin/candidates/${selectedDoc!.candidateId}/documents/${selectedDoc!.id}/download`, selectedDoc!.name)}
					>
						Unduh / Lihat File ↗
					</button>
				</div>
				<p class="muted" style="font-size: 12px; margin: 8px 0 0;">
					File ini diunduh secara terenkripsi menggunakan ephemeral bearer token melalui storage service backend.
				</p>
			</div>

			<div style="margin-bottom: 20px;">
				<label for="review-reason" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px;">
					Catatan Verifikasi (Wajib diisi jika minta revisi / ditolak):
				</label>
				<textarea
					id="review-reason"
					rows="3"
					placeholder="Tuliskan catatan perbaikan atau alasan penolakan..."
					bind:value={reviewReason}
					style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit; font-size: 14px;"
				></textarea>
			</div>

			<div style="display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
				<button class="button secondary small" onclick={() => (selectedDoc = null)}>Batal</button>
				<button
					class="button small"
					style="background: #fee2e2; color: #991b1b; border: 1px solid #fecdd3;"
					disabled={reviewMutation.isPending}
					onclick={() => submitDecision('revision_required')}
				>
					Minta Revisi
				</button>
				<button
					class="button primary small"
					style="background: var(--green); color: white;"
					disabled={reviewMutation.isPending}
					onclick={() => submitDecision('verified')}
				>
					{reviewMutation.isPending ? 'Menyimpan…' : 'Verifikasi & Loloskan (Approve)'}
				</button>
			</div>
		</div>
	</div>
{/if}
