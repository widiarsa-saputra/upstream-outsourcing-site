<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { getLocalCandidateDocuments, saveLocalCandidateDocuments } from '#lib/candidate/storage.ts';
	import {
		documentTypeLabels,
		documentStatusConfig,
		type CandidateDocument,
		type DocumentType
	} from '#lib/candidate/types.ts';

	const session = useSession();
	const queryClient = useQueryClient();

	const documentsQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'documents'],
		enabled: !!session.user?.id,
		queryFn: async () => {
			return getLocalCandidateDocuments(session.user!.id);
		}
	}));

	let activeUploadType = $state<DocumentType | null>(null);
	let uploadError = $state('');
	let uploadSuccessMessage = $state('');
	let isUploading = $state(false);

	const saveDocumentsMutation = createMutation(() => ({
		mutationFn: async (docs: CandidateDocument[]) => {
			saveLocalCandidateDocuments(session.user!.id, docs);
			return docs;
		},
		onSuccess: (saved) => {
			queryClient.setQueryData(['candidate', session.user?.id, 'documents'], saved);
			uploadSuccessMessage = 'Berkas berhasil diunggah dan masuk ke antrean verifikasi staf internal!';
			setTimeout(() => {
				uploadSuccessMessage = '';
			}, 4000);
		}
	}));

	function handleFileSelect(e: Event, type: DocumentType) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		uploadError = '';
		activeUploadType = type;

		// 1. Validasi Ukuran (Maks 5MB)
		if (file.size > 5 * 1024 * 1024) {
			uploadError = `Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal 5 MB.`;
			target.value = '';
			return;
		}

		// 2. Validasi Tipe MIME
		const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			uploadError = 'Format berkas tidak didukung. Harap unggah berkas PDF, JPG, atau PNG.';
			target.value = '';
			return;
		}

		isUploading = true;

		// Simulasi proses upload & kalkulasi hash
		setTimeout(() => {
			const currentDocs = documentsQuery.data || [];
			const existingIndex = currentDocs.findIndex((d) => d.type === type);

			const newDoc: CandidateDocument = {
				id: crypto.randomUUID(),
				type,
				title: documentTypeLabels[type].label,
				fileName: file.name,
				fileSize: file.size,
				mimeType: file.type,
				status: 'pending_review',
				uploadedAt: new Date().toISOString()
			};

			let updated: CandidateDocument[];
			if (existingIndex >= 0) {
				updated = [...currentDocs];
				updated[existingIndex] = newDoc;
			} else {
				updated = [...currentDocs, newDoc];
			}

			isUploading = false;
			activeUploadType = null;
			target.value = '';
			saveDocumentsMutation.mutate(updated);
		}, 800);
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
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Document Vault — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">DOCUMENT VAULT & VERIFICATION</p>
		<h1>Brankas <em>Dokumen.</em></h1>
		<p class="lead">
			Unggah dan kelola berkas wajib identitas dan kualifikasi kerja Anda. Seluruh berkas disimpan aman dan dienkripsi.
		</p>
	</div>
</div>

{#if uploadSuccessMessage}
	<div class="notice" role="status" style="background: #eef8ea; border-color: #badba7; color: var(--green); margin-bottom: 20px;">
		<p><strong>Berhasil!</strong> {uploadSuccessMessage}</p>
	</div>
{/if}

{#if uploadError}
	<div class="notice error" role="alert" style="margin-bottom: 20px;">
		<p><strong>Gagal Unggah:</strong> {uploadError}</p>
	</div>
{/if}

<div class="panel" style="background: #fdfdfc; border: 1px solid var(--line); border-radius: 12px; padding: 18px 24px; margin-bottom: 24px;">
	<h3 style="margin: 0 0 6px; font-size: 1rem; color: var(--green);">Keamanan & Privasi Dokumen Terjamin</h3>
	<p class="muted" style="font-size: 13px; margin: 0; line-height: 1.5;">
		Dokumen identitas Anda (KTP & Ijazah) diverifikasi terlebih dahulu oleh petugas internal dan diberi watermark sebelum dapat dilihat oleh mitra perusahaan alih daya.
	</p>
</div>

<div style="display: flex; flex-direction: column; gap: 16px;">
	{#each Object.entries(documentTypeLabels) as [typeKey, config]}
		{@const type = typeKey as DocumentType}
		{@const existing = (documentsQuery.data || []).find((d) => d.type === type)}
		{@const status = existing?.status || 'draft'}
		{@const statusInfo = documentStatusConfig[status]}

		<div
			class="panel"
			style="background: var(--paper); border: 1px solid {existing ? 'var(--line)' : '#e5ebd9'}; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;"
		>
			<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
				<div>
					<div style="display: flex; align-items: center; gap: 8px;">
						<h2 style="font-size: 1.15rem; margin: 0; color: var(--green);">{config.label}</h2>
						{#if config.required}
							<span style="font-size: 10px; font-weight: 700; color: #b91c1c; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">
								WAJIB
							</span>
						{/if}
					</div>
					<p class="muted" style="font-size: 13px; margin: 4px 0 0;">{config.description}</p>
				</div>

				<div style="display: flex; align-items: center; gap: 10px;">
					{#if existing}
						<span
							style="display: inline-block; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
							{status === 'verified' ? 'background: #dcfce7; color: #166534;' : ''}
							{status === 'pending_review' ? 'background: #fef9c3; color: #854d0e;' : ''}
							{status === 'revision_required' ? 'background: #fee2e2; color: #991b1b;' : ''}
							{status === 'draft' ? 'background: #f1f5f9; color: #475569;' : ''}"
						>
							{statusInfo.label}
						</span>
					{:else}
						<span style="font-size: 12px; color: var(--muted); background: #f4f6f1; padding: 4px 10px; border-radius: 999px;">
							Belum diunggah
						</span>
					{/if}
				</div>
			</div>

			{#if existing}
				<div style="background: #fafbf9; padding: 12px 16px; border-radius: 8px; border: 1px dashed var(--line); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
					<div>
						<p style="margin: 0; font-weight: 600; font-size: 14px; color: var(--ink);">{existing.fileName}</p>
						<span class="muted" style="font-size: 12px;">
							{formatBytes(existing.fileSize)} • Diunggah pada {formatDate(existing.uploadedAt)}
						</span>
					</div>
					<div style="display: flex; gap: 8px;">
						<label class="button secondary small" style="cursor: pointer; margin: 0;">
							{isUploading && activeUploadType === type ? 'Mengunggah…' : 'Ganti Berkas'}
							<input
								type="file"
								accept=".pdf,.jpg,.jpeg,.png"
								disabled={isUploading}
								onchange={(e) => handleFileSelect(e, type)}
								style="display: none;"
							/>
						</label>
					</div>
				</div>

				{#if existing.reviewNotes}
					<div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px; font-size: 13px; color: #9f1239;">
						<strong>Catatan Petugas:</strong> {existing.reviewNotes}
					</div>
				{/if}
			{:else}
				<div style="display: flex; align-items: center; gap: 12px; margin-top: 4px;">
					<label class="button primary small" style="cursor: pointer; margin: 0;">
						{isUploading && activeUploadType === type ? 'Mengunggah…' : '+ Unggah Dokumen'}
						<input
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							disabled={isUploading}
							onchange={(e) => handleFileSelect(e, type)}
							style="display: none;"
						/>
					</label>
					<span class="muted" style="font-size: 12px;">Format didukung: PDF, JPG, PNG (Maks 5 MB)</span>
				</div>
			{/if}
		</div>
	{/each}
</div>
