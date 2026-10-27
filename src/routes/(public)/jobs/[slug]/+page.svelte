<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { salaryLabel, statusLabel, dateLabel } from '#lib/marketplace/types.ts';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { getLocalCandidateDocuments } from '#lib/candidate/storage.ts';
	import { getLocalApplications, createApplication } from '#lib/candidate/application-store.ts';
	import JobContent from '#lib/components/JobContent.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const session = useSession();

	let showApplyModal = $state(false);
	let coverLetter = $state('');
	let applySuccess = $state(false);
	let applyError = $state('');

	const alreadyApplied = $derived.by(() => {
		if (!session.user?.id && !session.user?.email) return false;
		const all = getLocalApplications();
		return all.some(
			(a) =>
				(a.candidateId === session.user?.id || a.candidateEmail === session.user?.email) &&
				a.jobId === data.job.id
		);
	});

	const userDocs = $derived.by(() => {
		if (!session.user?.id) return [];
		return getLocalCandidateDocuments(session.user.id);
	});

	const hasResume = $derived(userDocs.some((d) => d.type === 'RESUME'));
	const hasIdCard = $derived(userDocs.some((d) => d.type === 'ID_CARD'));

	function handleApplySubmit() {
		applyError = '';
		if (!session.user) {
			void goto(`${resolve('/(app)/login')}?returnTo=${encodeURIComponent('/jobs/' + data.job.slug)}`);
			return;
		}

		if (!hasResume) {
			applyError = 'Anda wajib mengunggah CV / Resume di Document Vault sebelum mengirim lamaran.';
			return;
		}

		const snapshots = userDocs.map((d) => ({
			documentId: d.id,
			documentType: d.type,
			fileName: d.fileName,
			fileSize: d.fileSize,
			verifiedAt: d.verifiedAt || new Date().toISOString()
		}));

		createApplication({
			candidateId: session.user.id,
			candidateName: session.user.name,
			candidateEmail: session.user.email,
			candidatePhone: '',
			jobId: data.job.id,
			jobSlug: data.job.slug,
			jobTitle: data.job.title,
			vendorId: data.job.vendor.id,
			vendorName: data.job.vendor.name,
			vendorLocation: data.job.location,
			stage: 'applied',
			coverLetter: coverLetter.trim() || undefined,
			documents: snapshots
		});

		applySuccess = true;
		setTimeout(() => {
			showApplyModal = false;
			applySuccess = false;
			void goto(resolve('/(app)/(protected)/candidate/applications'));
		}, 1800);
	}
</script>

<svelte:head>
	<title>{data.job.title} di {data.job.vendor.name} — Upstream</title>
	<meta name="description" content={data.job.description.slice(0, 160)} />
	<meta property="og:title" content={data.job.title + ' — ' + data.job.vendor.name} />
	<meta property="og:description" content={data.job.description.slice(0, 160)} />
</svelte:head>

<a class="back-link" href={resolve('/(public)/jobs')}>← Semua peluang</a>

<section class="public-detail-heading">
	<span class="company-monogram">{data.job.vendor.name.slice(0, 2).toUpperCase()}</span>
	<p class="eyebrow">{data.job.industry} / {statusLabel[data.job.employmentType]}</p>
	<h1>{data.job.title}</h1>
	<p>
		<a href={resolve('/(public)/vendors/[slug]', { slug: data.job.vendor.slug })}>
			{data.job.vendor.name} ↗
		</a>
		<span>·</span>
		{data.job.location}
	</p>
</section>

<div class="public-detail-layout">
	<section class="panel"><JobContent job={data.job} /></section>

	<aside class="apply-panel">
		<p class="eyebrow">LANGKAH BERIKUTNYA</p>
		<h2>Peluang untuk<br /><em>cerita baru.</em></h2>
		<strong>{salaryLabel(data.job)}</strong>
		<p>{data.job.openings} posisi tersedia<br />Batas lamaran: {dateLabel(data.job.deadline)}</p>

		{#if session.user?.role === 'CANDIDATE'}
			{#if alreadyApplied}
				<div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
					<strong style="color: #0369a1; font-size: 14px;">Lamaran Sudah Dikirim</strong>
					<p class="muted" style="font-size: 12px; margin: 4px 0 0;">Anda telah melamar untuk posisi ini.</p>
				</div>
				<a class="button full secondary" href={resolve('/(app)/(protected)/candidate/applications')}>
					Pantau Status Lamaran ↗
				</a>
			{:else}
				<button class="button full primary" onclick={() => (showApplyModal = true)}>
					Lamar Posisi Ini Sekarang ↗
				</button>
				<p class="muted" style="margin-top: 8px; font-size: 12px;">
					Dokumen dari Document Vault Anda akan dilampirkan otomatis.
				</p>
			{/if}
		{:else if session.user}
			<div class="notice" style="margin-top: 10px;">
				<p style="font-size: 13px;">Anda masuk sebagai <strong>{session.user.role}</strong>. Masuk sebagai kandidat untuk melamar lowongan ini.</p>
			</div>
		{:else}
			<a
				class="button full"
				href="{resolve('/(app)/login')}?returnTo={encodeURIComponent('/jobs/' + data.job.slug)}"
			>
				Masuk sebagai kandidat ↗
			</a>
			<p class="muted">Masuk untuk melengkapi profil kandidat Anda.</p>
		{/if}

		<div class="verified-caption"><span class="status-dot"></span> MITRA TELAH DIVERIFIKASI</div>
	</aside>
</div>

<!-- Modal Form Pengajuan Lamaran -->
{#if showApplyModal}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 100; padding: 16px;"
	>
		<div style="background: white; border-radius: 12px; width: 100%; max-width: 540px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
				<div>
					<span class="eyebrow" style="margin-bottom: 4px;">PENGIRIMAN LAMARAN KERJA</span>
					<h3 style="margin: 0; color: var(--green);">{data.job.title}</h3>
					<p class="muted" style="font-size: 13px; margin: 2px 0 0;">{data.job.vendor.name} • {data.job.location}</p>
				</div>
				<button
					onclick={() => (showApplyModal = false)}
					style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;"
				>
					×
				</button>
			</div>

			{#if applySuccess}
				<div class="notice" style="background: #eef8ea; border-color: #badba7; color: var(--green); padding: 16px;">
					<strong>Berhasil Terkirim!</strong> Mengalihkan ke dashboard lamaran Anda…
				</div>
			{:else}
				{#if applyError}
					<div class="notice error" style="margin-bottom: 16px;">
						<p>{applyError}</p>
					</div>
				{/if}

				<!-- Checklist Berkas Wajib -->
				<div style="background: #f8faf6; border: 1px solid var(--line); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
					<h4 style="margin: 0 0 8px; font-size: 13px; color: var(--green); text-transform: uppercase;">Berkas Terlampir dari Vault</h4>
					<div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
						<div style="display: flex; justify-content: space-between;">
							<span>Curriculum Vitae (CV) PDF:</span>
							<strong style="color: {hasResume ? '#166534' : '#b91c1c'};">
								{hasResume ? '✓ Terlampir' : '✗ Belum Ada'}
							</strong>
						</div>
						<div style="display: flex; justify-content: space-between;">
							<span>Kartu Identitas (KTP):</span>
							<strong style="color: {hasIdCard ? '#166534' : '#b91c1c'};">
								{hasIdCard ? '✓ Terlampir' : '✗ Belum Ada'}
							</strong>
						</div>
					</div>
					{#if !hasResume}
						<a
							class="text-link"
							href={resolve('/(app)/(protected)/candidate/documents')}
							style="display: inline-block; margin-top: 8px; font-size: 12px;"
						>
							Buka Vault & Unggah CV Sekarang →
						</a>
					{/if}
				</div>

				<div style="margin-bottom: 20px;">
					<label for="cover-letter" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px;">
						Catatan / Surat Pengantar Singkat (Opsional):
					</label>
					<textarea
						id="cover-letter"
						rows="3"
						placeholder="Sampaikan secara ringkas mengapa Anda kandidat yang tepat untuk posisi alih daya ini..."
						bind:value={coverLetter}
						style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit; font-size: 14px;"
					></textarea>
				</div>

				<div style="display: flex; justify-content: flex-end; gap: 10px;">
					<button class="button secondary small" onclick={() => (showApplyModal = false)}>Batal</button>
					<button
						class="button primary small"
						disabled={!hasResume}
						onclick={handleApplySubmit}
					>
						Kirim Lamaran Sekarang ↗
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
