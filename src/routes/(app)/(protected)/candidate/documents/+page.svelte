<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import {
		candidateDocumentLabels,
		candidateDocumentStatusConfig,
		uploadCandidateDocument,
		downloadCandidateDocument,
		type CandidateProfile,
		type CandidateDocumentType
	} from '#lib/candidate/types.ts';

	const session = useSession();
	const queryClient = useQueryClient();

	const profileQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'profile'],
		enabled: !!session.user?.id,
		queryFn: ({ signal }) => session.api.request<CandidateProfile>('/candidate/profile', { signal })
	}));

	let activeUploadType = $state<CandidateDocumentType | null>(null);
	let uploadError = $state('');
	let uploadSuccessMessage = $state('');
	let isUploading = $state(false);

	const deleteDocMutation = createMutation(() => ({
		mutationFn: (id: string) =>
			session.api.request('/candidate/documents/' + id, { method: 'DELETE' }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
		}
	}));

	async function handleFileSelect(e: Event, type: CandidateDocumentType) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		uploadError = '';
		activeUploadType = type;
		isUploading = true;

		try {
			await uploadCandidateDocument(session.api, type, file);
			uploadSuccessMessage = `Berkas ${file.name} berhasil diunggah ke storage aman dan masuk antrean verifikasi!`;
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
			setTimeout(() => {
				uploadSuccessMessage = '';
			}, 4000);
		} catch (err: any) {
			uploadError = err.message || 'Gagal mengunggah berkas. Periksa koneksi dan coba kembali.';
		} finally {
			isUploading = false;
			activeUploadType = null;
			target.value = '';
		}
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
			Unggah dan kelola berkas wajib identitas dan kualifikasi kerja Anda. Seluruh berkas disimpan aman dan dienkripsi di cloud storage backend.
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

{#if profileQuery.isPending}
	<div class="notice" role="status">Memuat data dokumen vault…</div>
{:else if profileQuery.isError}
	<div class="notice error" role="alert">{errorMessage(profileQuery.error)}</div>
{:else}
	<div style="display: flex; flex-direction: column; gap: 16px;">
		{#each Object.entries(candidateDocumentLabels) as [typeKey, config]}
			{@const type = typeKey as CandidateDocumentType}
			{@const existing = (profileQuery.data?.documents || []).find((d) => d.type === type && d.active)}
			{@const status = existing?.verificationStatus || 'pending'}
			{@const statusInfo = candidateDocumentStatusConfig[status] || candidateDocumentStatusConfig.pending}

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
								{status === 'pending' ? 'background: #fef9c3; color: #854d0e;' : ''}
								{status === 'revision_required' ? 'background: #fee2e2; color: #991b1b;' : ''}
								{status === 'rejected' ? 'background: #fee2e2; color: #991b1b;' : ''}"
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
							<p style="margin: 0; font-weight: 600; font-size: 14px; color: var(--ink);">{existing.name}</p>
							<span class="muted" style="font-size: 12px;">
								{formatBytes(existing.size)} • Diunggah pada {formatDate(existing.createdAt)}
							</span>
						</div>
						<div style="display: flex; gap: 8px;">
							<button
								class="button secondary small"
								onclick={() => downloadCandidateDocument(session.api, `/candidate/documents/${existing.id}/download`, existing.name)}
							>
								Unduh ↗
							</button>
							<label class="button secondary small" style="cursor: pointer; margin: 0;">
								{isUploading && activeUploadType === type ? 'Mengunggah…' : 'Ganti'}
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

					{#if existing.reviewReason}
						<div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px; font-size: 13px; color: #9f1239;">
							<strong>Catatan Petugas:</strong> {existing.reviewReason}
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
{/if}
