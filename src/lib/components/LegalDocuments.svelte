<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import { uploadLegal, downloadLegal } from '#lib/marketplace/files.ts';
	import { statusLabel, type Vendor } from '#lib/marketplace/types.ts';
	let { vendor, readonly = false }: { vendor: Vendor; readonly?: boolean } = $props();
	const session = useSession();
	const queries = useQueryClient();
	let selected = $state<'NPWP' | 'NIB' | 'AGREEMENT'>('NPWP');
	let files = $state<FileList>();
	const upload = createMutation(() => ({
		mutationFn: async () => {
			if (!files?.[0]) throw new Error('Pilih berkas terlebih dahulu.');
			return uploadLegal(session.api, selected, files[0]);
		},
		onSuccess: () => queries.invalidateQueries({ queryKey: ['vendor', session.user?.id] })
	}));
	const remove = createMutation(() => ({
		mutationFn: (id: string) =>
			session.api.request('/vendor/legal-documents/' + id, { method: 'DELETE' }),
		onSuccess: () => queries.invalidateQueries({ queryKey: ['vendor', session.user?.id] })
	}));
	const download = createMutation(() => ({
		mutationFn: ({ id, name }: { id: string; name: string }) =>
			downloadLegal(
				session.api,
				readonly
					? `/admin/vendors/${vendor.id}/legal-documents/${id}/download`
					: `/vendor/legal-documents/${id}/download`,
				name
			)
	}));
</script>

<section class="panel legal-panel">
	<div class="section-heading">
		<div>
			<p class="eyebrow">DOKUMEN PRIVAT</p>
			<h2>Legalitas perusahaan.</h2>
		</div>
		<span class="tag">MAKS. 5 MB / BERKAS</span>
	</div>
	<p class="muted">
		NPWP, NIB, dan perjanjian kerja sama hanya dapat diakses vendor pemilik dan petugas clearance.
	</p>
	<div class="document-list">
		{#each ['NPWP', 'NIB', 'AGREEMENT'] as type (type)}{@const doc = vendor.documents.find(
				(d) => d.type === type && d.active
			)}
			<div class="document-row">
				<div>
					<strong>{statusLabel[type]}</strong><small
						>{doc ? `${doc.name} · ${(doc.size / 1024).toFixed(0)} KB` : 'Belum diunggah'}</small
					>
				</div>
				{#if doc}<div class="inline-actions">
						<button
							class="text-button"
							disabled={download.isPending}
							onclick={() => download.mutate({ id: doc.id, name: doc.name })}>Unduh ↗</button
						>{#if !readonly}<button
								class="text-button danger-text"
								disabled={remove.isPending || upload.isPending}
								onclick={() => {
									if (
										confirm(
											'Lepas dokumen ini? Clearance akan kembali ke draft dan lowongan tayang akan disembunyikan.'
										)
									)
										remove.mutate(doc.id);
								}}>Lepas</button
							>{/if}
					</div>{/if}
			</div>{/each}
	</div>
	{#if !readonly}<form
			class="upload-form"
			onsubmit={(event) => {
				event.preventDefault();
				upload.mutate();
			}}
		>
			<div>
				<label for="legal-type">Jenis dokumen</label><select id="legal-type" bind:value={selected}
					><option value="NPWP">NPWP</option><option value="NIB">NIB</option><option
						value="AGREEMENT">Perjanjian kerja sama</option
					></select
				>
			</div>
			<div>
				<label for="legal-file">Berkas PDF / JPG / PNG</label><input
					id="legal-file"
					type="file"
					accept="application/pdf,image/jpeg,image/png"
					bind:files
					required
				/>
			</div>
			<button class="button" disabled={upload.isPending || remove.isPending}
				>{upload.isPending ? 'Mengunggah…' : 'Unggah berkas ↗'}</button
			>
		</form>
		<p class="field-help">
			Mengganti legalitas membatalkan clearance sebelumnya dan menyembunyikan lowongan yang sedang
			tayang.
		</p>{/if}
	{#if upload.isSuccess}<p class="notice" role="status">
			Berkas tersimpan privat. Lengkapi ketiga dokumen sebelum mengajukan clearance.
		</p>{/if}{#if upload.isError || remove.isError || download.isError}<p
			class="notice error"
			role="alert"
		>
			{errorMessage(upload.error || remove.error || download.error)}
		</p>{/if}
</section>
