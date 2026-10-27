<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { createQuery, createMutation } from '@tanstack/svelte-query';
	import { salaryLabel, statusLabel, dateLabel, type PublicJob } from '#lib/marketplace/types.ts';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { CandidateProfile } from '#lib/candidate/types.ts';
	import {
		applicationStageConfig,
		type Application,
		type CreateApplication
	} from '#lib/candidate/applications.ts';
	import PublicHeader from '#lib/components/PublicHeader.svelte';
	import PublicFooter from '#lib/components/PublicFooter.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const session = useSession('user');

	// State modal lamaran & otentikasi
	let selectedJob = $state<PublicJob | null>(null);
	let showAuthModal = $state(false);
	let showApplyModal = $state(false);
	let coverLetter = $state('');
	let applySuccess = $state(false);
	let applyError = $state('');

	// Ambil profil kandidat jika sedang login sebagai kandidat
	const profileQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'profile'],
		enabled: !!session.user && session.user.role === 'CANDIDATE',
		queryFn: ({ signal }) => session.api.request<CandidateProfile>('/candidate/profile', { signal })
	}));

	// Ambil daftar lamaran aktif kandidat untuk deteksi "Sudah Dilamar"
	const myAppsQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'applications'],
		enabled: !!session.user && session.user.role === 'CANDIDATE',
		queryFn: ({ signal }) => session.api.request<Application[]>('/candidate/applications', { signal })
	}));

	const appliedJobIds = $derived.by(() => {
		const apps = myAppsQuery.data || [];
		return new Set(apps.map((a) => a.jobId));
	});

	const userDocs = $derived.by(() => {
		return profileQuery.data?.documents || [];
	});

	const resumeDoc = $derived(userDocs.find((d) => d.type === 'CV' && d.active));
	const idDoc = $derived(userDocs.find((d) => d.type === 'KTP' && d.active));
	const hasResume = $derived(Boolean(resumeDoc));
	const hasIdCard = $derived(Boolean(idDoc));

	// Mutasi pengajuan lamaran
	const applyMutation = createMutation(() => ({
		mutationFn: (body: CreateApplication) =>
			session.api.request<Application>('/candidate/applications', {
				method: 'POST',
				body: JSON.stringify(body)
			}),
		onSuccess: () => {
			applySuccess = true;
			setTimeout(() => {
				showApplyModal = false;
				applySuccess = false;
				selectedJob = null;
				void goto(resolve('/(app)/(protected)/candidate/applications'));
			}, 1800);
		},
		onError: (err) => {
			applyError = errorMessage(err);
		}
	}));

	function handleOpenApply(job: PublicJob) {
		selectedJob = job;
		applyError = '';

		// 1. Jika belum login -> buka modal permintaan login
		if (!session.user || session.status !== 'authenticated') {
			showAuthModal = true;
			return;
		}

		// 2. Jika bukan kandidat (misal vendor atau admin)
		if (session.user.role !== 'CANDIDATE') {
			alert(
				`Anda saat ini masuk sebagai ${session.user.role}. Untuk melamar posisi pekerjaan, silakan gunakan akun Kandidat Pelamar.`
			);
			return;
		}

		// 3. Jika sudah pernah melamar
		if (appliedJobIds.has(job.id)) {
			alert(`Anda sudah mengirimkan lamaran untuk posisi "${job.title}". Silakan periksa status lamaran Anda di Portal Pelamar.`);
			void goto(resolve('/(app)/(protected)/candidate/applications'));
			return;
		}

		// 4. Jika kandidat login dan belum melamar -> buka modal apply
		coverLetter = '';
		showApplyModal = true;
	}

	function handleConfirmApply() {
		if (!selectedJob) return;
		applyError = '';

		if (!hasResume) {
			applyError = 'Anda wajib mengunggah CV / Resume aktif di Document Vault sebelum mengirimkan lamaran.';
			return;
		}

		applyMutation.mutate({
			jobId: selectedJob.id,
			coverLetter: coverLetter.trim() || undefined
		});
	}
</script>

<svelte:head>
	<title>Upstream — Platform Alih Daya & Rekrutmen Talenta Terverifikasi</title>
	<meta
		name="description"
		content="Platform alih daya dan rekrutmen kerja terverifikasi di Indonesia. Jelajahi lowongan resmi mitra perusahaan, digital CV, dan jaminan zero placement fee."
	/>
</svelte:head>

<div class="public-site">
	<PublicHeader />

	<!-- Hero Section -->
	<section class="landing-main" style="padding: 20px 0 60px;">
		<p class="eyebrow">MANUSIA. PELUANG. PERTUMBUHAN.</p>
	<h1 style="font-size: clamp(2.8rem, 6vw, 5rem); line-height: 1.08; max-width: 960px; margin-bottom: 24px;">
		Langkah berikutnya,<br /><em>bersama Upstream.</em>
	</h1>
	<p class="lead" style="max-width: 760px; margin-bottom: 32px; font-size: 18px; color: var(--muted); line-height: 1.6;">
		Ruang terverifikasi bertemunya talenta terbaik dengan mitra penyelenggara kerja. Bangun Digital CV Anda, unggah dokumen di brankas terenkripsi, dan lamar peluang tanpa perantara.
	</p>

	<div class="actions" style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-bottom: 48px;">
		<a class="button" href="#daftar-lowongan">Jelajahi Lowongan Kerja ↓</a>
		{#if !session.user}
			<a class="button secondary" href={resolve('/(app)/register')}>Daftar sebagai Pelamar ↗</a>
			<a class="text-link" href="{resolve('/(app)/register')}?role=VENDOR" style="font-size: 13px; font-weight: 600; color: var(--green);">
				Untuk Mitra Penyelenggara →
			</a>
		{:else if session.user.role === 'CANDIDATE'}
			<a class="button secondary" href="#user-dashboard">Lihat Dashboard Saya ↓</a>
			<a class="text-link" href={resolve('/(app)/(protected)/candidate')} style="font-size: 13px; font-weight: 600; color: var(--green);">
				Buka Portal Pelamar ↗
			</a>
		{:else if session.user.role === 'VENDOR'}
			<a class="button secondary" href={resolve('/(app)/(protected)/vendor')}>Buka Portal Penyelenggara ↗</a>
		{/if}
	</div>

	<!-- Highlight Key Metrics -->
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 24px 0;">
		<div>
			<strong style="display: block; font-size: 26px; color: var(--green); font-weight: 700;">{data.jobs.total}+</strong>
			<span style="font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px;">Lowongan Terbuka</span>
		</div>
		<div>
			<strong style="display: block; font-size: 26px; color: var(--green); font-weight: 700;">100%</strong>
			<span style="font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px;">Mitra Terverifikasi (NIB & NPWP)</span>
		</div>
		<div>
			<strong style="display: block; font-size: 26px; color: var(--green); font-weight: 700;">Rp 0</strong>
			<span style="font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px;">Zero Placement Fee (Gratis)</span>
		</div>
		<div>
			<strong style="display: block; font-size: 26px; color: var(--green); font-weight: 700;">Vault 🔒</strong>
			<span style="font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px;">Dokumen Terenkripsi</span>
		</div>
	</div>
</section>

<!-- ================= USER DASHBOARD SECTION (Tampil saat user login) ================= -->
{#if session.status === 'authenticated' && session.user && session.user.role === 'CANDIDATE'}
	<section id="user-dashboard" style="background: white; border: 1px solid var(--line); border-radius: 16px; padding: 36px 32px; margin-bottom: 48px; box-shadow: 0 6px 24px rgba(0,0,0,0.03);">
		<!-- Top Bar: Sesi Pengguna -->
		<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 24px; margin-bottom: 28px; flex-wrap: wrap; gap: 20px;">
			<div style="display: flex; align-items: center; gap: 16px;">
				<div style="position: relative;">
					<span style="width: 54px; height: 54px; border-radius: 50%; background: #e7eddf; color: var(--green); display: grid; place-items: center; font-size: 22px; font-weight: 700; border: 2px solid var(--line);">
						{session.user.name.charAt(0).toUpperCase()}
					</span>
					<span style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #22c55e; border: 2px solid white; border-radius: 50%;" title="Sesi Aktif"></span>
				</div>
				<div>
					<div style="display: flex; align-items: center; gap: 8px;">
						<h2 style="margin: 0; font-size: 22px; color: var(--ink);">{session.user.name}</h2>
						<span style="background: #eef5e9; color: var(--green); font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 600;">
							Kandidat Pelamar
						</span>
					</div>
					<p style="margin: 4px 0 0; font-size: 13px; color: var(--muted);">
						📧 {session.user.email}
						{#if profileQuery.data?.phone}
							• 📞 {profileQuery.data.phone}
						{/if}
						{#if profileQuery.data?.address}
							• 📍 {profileQuery.data.address}
						{/if}
					</p>
				</div>
			</div>

			<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
				<a class="button secondary" style="font-size: 12px; padding: 8px 14px; min-height: 36px;" href={resolve('/(app)/(protected)/candidate/profile')}>
					✏️ Edit Digital CV ↗
				</a>
				<a class="button secondary" style="font-size: 12px; padding: 8px 14px; min-height: 36px;" href={resolve('/(app)/(protected)/candidate/documents')}>
					📁 Buka Document Vault ↗
				</a>
				<button
					type="button"
					class="text-button"
					style="font-size: 12px; color: #b91c1c; padding: 8px 12px;"
					onclick={() => session.logout()}
				>
					Keluar Sesi
				</button>
			</div>
		</div>

		<!-- Grid 2 Kolom: Kolom 1 (Seluruh Applyment) & Kolom 2 (Dokumen di Vault) -->
		<div style="display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 28px;">
			<!-- MODULE 1: SELURUH APPLYMENT (LAMARAN SAYA) -->
			<div>
				<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
					<div>
						<span class="eyebrow" style="margin-bottom: 2px;">STATUS LAMARAN ANDA</span>
						<h3 style="margin: 0; font-size: 18px; color: var(--green);">
							Seluruh Applyment ({myAppsQuery.data?.length || 0})
						</h3>
					</div>
					<a href={resolve('/(app)/(protected)/candidate/applications')} style="font-size: 12px; font-weight: 600; color: var(--green); text-decoration: underline;">
						Semua di Tracker ↗
					</a>
				</div>

				{#if myAppsQuery.isPending}
					<div class="notice" style="font-size: 13px;">Memuat riwayat lamaran Anda…</div>
				{:else if myAppsQuery.isError}
					<div class="notice error" style="font-size: 13px;">{errorMessage(myAppsQuery.error)}</div>
				{:else if !myAppsQuery.data || myAppsQuery.data.length === 0}
					<div style="background: #fbfcf9; border: 1px dashed var(--line); border-radius: 12px; padding: 28px; text-align: center;">
						<span style="font-size: 28px; display: block; margin-bottom: 8px;">📬</span>
						<strong style="color: var(--ink); font-size: 14px;">Belum Ada Lamaran Terkirim</strong>
						<p style="color: var(--muted); font-size: 12px; margin: 4px 0 14px; line-height: 1.5;">
							Anda belum melamar lowongan kerja mana pun. Jelajahi formasi yang tersedia di bawah dan ajukan berkas Anda.
						</p>
						<a class="button" href="#daftar-lowongan" style="font-size: 11px; padding: 8px 14px;">
							Pilih Lowongan Sekarang ↓
						</a>
					</div>
				{:else}
					<div style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto; padding-right: 6px;">
						{#each myAppsQuery.data as app (app.id)}
							{@const stage = applicationStageConfig[app.stage] || { label: app.stage, tone: 'info', description: '' }}
							<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px;">
								<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px;">
									<div>
										<strong style="font-size: 14px; color: var(--ink); display: block;">
											{app.jobTitle || 'Posisi Lowongan'}
										</strong>
										<span style="font-size: 12px; color: #526b4d; font-weight: 600;">
											{app.vendorName || 'Mitra Penyelenggara'} • 📍 {app.vendorLocation || 'Indonesia'}
										</span>
									</div>
									<span
										style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; white-space: nowrap;
										{stage.tone === 'success' ? 'background: #dcfce7; color: #15803d;' : ''}
										{stage.tone === 'pending' ? 'background: #fef3c7; color: #92400e;' : ''}
										{stage.tone === 'danger' ? 'background: #fee2e2; color: #b91c1c;' : ''}
										{stage.tone === 'info' ? 'background: #e0f2fe; color: #0369a1;' : ''}
										{stage.tone === 'neutral' ? 'background: #f1f5f9; color: #475569;' : ''}"
									>
										{stage.label}
									</span>
								</div>

								<div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--muted); border-top: 1px solid #edf1eb; padding-top: 8px; margin-top: 8px;">
									<span>Dilamar: {new Date(app.appliedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
									<a href={resolve('/(app)/(protected)/candidate/applications')} style="color: var(--green); font-weight: 600; text-decoration: underline;">
										Detail Progres ↗
									</a>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- MODULE 2: DOKUMEN YANG DI-UPLOAD (DOCUMENT VAULT SUMMARY) -->
			<div>
				<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
					<div>
						<span class="eyebrow" style="margin-bottom: 2px;">BRANKAS DIGITAL</span>
						<h3 style="margin: 0; font-size: 18px; color: var(--green);">Dokumen di Vault</h3>
					</div>
					<a href={resolve('/(app)/(protected)/candidate/documents')} style="font-size: 12px; font-weight: 600; color: var(--green); text-decoration: underline;">
						Kelola Vault ↗
					</a>
				</div>

				<div style="display: flex; flex-direction: column; gap: 10px;">
					<!-- Dokumen CV / Resume -->
					<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
						<div style="display: flex; align-items: center; gap: 10px;">
							<span style="font-size: 20px;">📄</span>
							<div>
								<strong style="font-size: 13px; color: var(--ink); display: block;">Curriculum Vitae (CV)</strong>
								{#if resumeDoc}
									<span style="font-size: 11px; color: var(--muted);">
										{resumeDoc.name} ({Math.round(resumeDoc.size / 1024)} KB)
									</span>
								{:else}
									<span style="font-size: 11px; color: #dc2626; font-weight: 600;">
										⚠️ Belum diunggah (Wajib untuk melamar)
									</span>
								{/if}
							</div>
						</div>
						<div>
							{#if resumeDoc}
								<span style="font-size: 11px; background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
									✓ Aktif
								</span>
							{:else}
								<a class="button secondary" style="font-size: 10px; padding: 5px 10px;" href={resolve('/(app)/(protected)/candidate/documents')}>
									Unggah ↗
								</a>
							{/if}
						</div>
					</div>

					<!-- Dokumen KTP -->
					<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
						<div style="display: flex; align-items: center; gap: 10px;">
							<span style="font-size: 20px;">🪪</span>
							<div>
								<strong style="font-size: 13px; color: var(--ink); display: block;">Kartu Tanda Penduduk (KTP)</strong>
								{#if idDoc}
									<span style="font-size: 11px; color: var(--muted);">
										{idDoc.name} ({Math.round(idDoc.size / 1024)} KB)
									</span>
								{:else}
									<span style="font-size: 11px; color: var(--muted);">
										Belum diunggah (Opsional / verifikasi)
									</span>
								{/if}
							</div>
						</div>
						<div>
							{#if idDoc}
								<span style="font-size: 11px; background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
									✓ Aktif
								</span>
							{:else}
								<a class="button secondary" style="font-size: 10px; padding: 5px 10px;" href={resolve('/(app)/(protected)/candidate/documents')}>
									Unggah ↗
								</a>
							{/if}
						</div>
					</div>

					<!-- Dokumen Lainnya jika ada -->
					{#each userDocs.filter((d) => d.type !== 'CV' && d.type !== 'KTP' && d.active) as extraDoc (extraDoc.id)}
						<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
							<div style="display: flex; align-items: center; gap: 10px;">
								<span style="font-size: 18px;">📜</span>
								<div>
									<strong style="font-size: 12px; color: var(--ink); display: block;">{extraDoc.type}: {extraDoc.name}</strong>
									<span style="font-size: 11px; color: var(--muted);">{Math.round(extraDoc.size / 1024)} KB</span>
								</div>
							</div>
							<span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
								Lampiran
							</span>
						</div>
					{/each}

					<div style="background: #edf0e6; border-radius: 8px; padding: 12px; font-size: 11px; color: #496347; line-height: 1.5; margin-top: 4px;">
						🔒 <strong>Keamanan Berkas:</strong> Berkas di Document Vault terenkripsi dan otomatis dilampirkan setiap Anda mengirimkan lamaran kerja.
					</div>
				</div>
			</div>
		</div>
	</section>
{:else if session.status === 'authenticated' && session.user && session.user.role === 'VENDOR'}
	<!-- Sesi Mitra Penyelenggara -->
	<section style="background: #edf0e6; border: 1px solid var(--line); border-radius: 16px; padding: 32px; margin-bottom: 48px;">
		<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
			<div style="display: flex; align-items: center; gap: 14px;">
				<span style="width: 48px; height: 48px; border-radius: 50%; background: var(--green); color: white; display: grid; place-items: center; font-size: 20px; font-weight: bold;">
					🏢
				</span>
				<div>
					<h3 style="margin: 0; font-size: 20px; color: var(--green);">Sesi Mitra: {session.user.name}</h3>
					<p style="margin: 2px 0 0; font-size: 13px; color: #496347;">{session.user.email} • Akun Penyelenggara Kerja</p>
				</div>
			</div>
			<div style="display: flex; gap: 10px;">
				<a class="button" href={resolve('/(app)/(protected)/vendor')}>Buka Portal Penyelenggara ↗</a>
				<button type="button" class="text-button" onclick={() => session.logout()}>Keluar</button>
			</div>
		</div>
	</section>
{/if}

<!-- Section Daftar Lowongan & Apply -->
<section id="daftar-lowongan" style="padding: 40px 0 60px;">
	<div class="results-heading" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
		<div>
			<p class="eyebrow" style="margin-bottom: 6px;">PELUANG KERJA AKTIF</p>
			<h2 style="font-size: 32px; margin: 0; color: var(--ink);">Lowongan Pilihan Siap Dilamar.</h2>
			<p style="color: var(--muted); font-size: 14px; margin: 6px 0 0;">
				Peluang kerja alih daya langsung dari mitra penyelenggara resmi. Pilih posisi dan ajukan lamaran secara langsung.
			</p>
		</div>
		<a class="button secondary" href={resolve('/(public)/jobs')}>
			Lihat Semua Lowongan ({data.jobs.total}) ↗
		</a>
	</div>

	<!-- Grid Lowongan Kerja -->
	<div class="public-job-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px;">
		{#each data.jobs.items as job (job.id)}
			{@const isApplied = appliedJobIds.has(job.id)}
			<article
				class="public-job-card"
				style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.03); transition: transform 0.15s, box-shadow 0.15s;"
			>
				<div>
					<div class="job-card-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
						<span class="company-monogram" style="width: 38px; height: 38px; border-radius: 8px; background: #e7eddf; color: var(--green); font-weight: 700; display: grid; place-items: center; font-size: 14px;">
							{job.vendor.name.slice(0, 2).toUpperCase()}
						</span>
						<div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
							<span class="job-type" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #f3f5ee; color: var(--green); font-weight: 600;">
								{statusLabel[job.employmentType] || job.employmentType}
							</span>
							<span class="job-type" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #eef2eb; color: #496347; font-weight: 600;">
								{statusLabel[job.workMode] || job.workMode}
							</span>
							{#if session.user && session.user.role === 'CANDIDATE'}
								{#if isApplied}
									<span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: #dcfce7; color: #166534; border: 1px solid #86efac; display: inline-flex; align-items: center; gap: 4px;">
										✓ DONE
									</span>
								{:else}
									<span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">
										Belum
									</span>
								{/if}
							{/if}
						</div>
					</div>

					<p class="job-company" style="font-size: 12px; font-weight: 600; color: #526b4d; margin: 0 0 4px;">
						{job.vendor.name}
					</p>
					<h3 style="font-size: 18px; margin: 0 0 8px; line-height: 1.3;">
						<a href={resolve('/(public)/jobs/[slug]', { slug: job.slug })} style="color: var(--ink); text-decoration: none;">
							{job.title}
						</a>
					</h3>
					<p class="job-card-location" style="font-size: 12px; color: var(--muted); margin: 0 0 12px;">
						📍 {job.location} • 🏢 {job.industry}
					</p>
					<p class="job-card-description" style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0 0 16px;">
						{job.description.slice(0, 130)}{job.description.length > 130 ? '…' : ''}
					</p>
				</div>

				<div>
					<div style="border-top: 1px solid var(--line); padding-top: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: baseline;">
						<span style="font-size: 13px; font-weight: 700; color: var(--green);">
							{salaryLabel(job)}
						</span>
						<span style="font-size: 11px; color: var(--muted);">
							Batas: {dateLabel(job.deadline)}
						</span>
					</div>

					<!-- Tombol Aksi: Detail & Apply -->
					<div style="display: flex; gap: 10px; align-items: center;">
						<a
							href={resolve('/(public)/jobs/[slug]', { slug: job.slug })}
							class="button secondary"
							style="flex: 1; text-align: center; font-size: 12px; padding: 9px 12px; min-height: 38px;"
						>
							Lihat Detail ↗
						</a>

						{#if isApplied}
							<a
								href={resolve('/(app)/(protected)/candidate/applications')}
								class="button"
								style="flex: 1; text-align: center; font-size: 12px; padding: 9px 12px; min-height: 38px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;"
							>
								✓ Sudah Dilamar
							</a>
						{:else}
							<button
								type="button"
								class="button primary"
								style="flex: 1; font-size: 12px; padding: 9px 12px; min-height: 38px;"
								onclick={() => handleOpenApply(job)}
							>
								Lamar Posisi Ini ↗
							</button>
						{/if}
					</div>
				</div>
			</article>
		{:else}
			<div class="empty-state" style="grid-column: 1 / -1; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 48px; text-align: center;">
				<h3 style="margin-top: 0;">Belum ada lowongan yang tersedia saat ini.</h3>
				<p class="muted">Silakan periksa kembali beberapa saat lagi atau jelajahi profil mitra penyelenggara kami.</p>
				<a class="button secondary" href={resolve('/(public)/vendors')}>Lihat Mitra Penyelenggara →</a>
			</div>
		{/each}
	</div>
</section>

<!-- Section Alur Mudah Bergabung -->
<section style="background: white; border: 1px solid var(--line); border-radius: 16px; padding: 48px 40px; margin-bottom: 60px; box-shadow: 0 6px 20px rgba(0,0,0,0.02);">
	<div style="max-width: 680px; margin-bottom: 36px;">
		<p class="eyebrow" style="margin-bottom: 6px;">ALUR PENEMPATAN KERJA</p>
		<h2 style="font-size: 32px; margin: 0 0 10px; color: var(--ink);">Empat langkah mudah meniti karier.</h2>
		<p style="color: var(--muted); font-size: 15px; margin: 0; line-height: 1.6;">
			Transparan, terstruktur, dan tanpa pungutan biaya apa pun bagi para talenta.
		</p>
	</div>

	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 24px;">
			<span style="font-size: 28px; display: block; margin-bottom: 12px;">📝</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">1. Profil & Digital CV</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Buat akun dan susun riwayat kerja, pendidikan, serta keahlian kompetensi Anda secara rapi.
			</p>
		</div>

		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 24px;">
			<span style="font-size: 28px; display: block; margin-bottom: 12px;">🛡️</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">2. Document Vault</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Unggah CV PDF dan KTP Anda sekali saja. Dokumen disimpan aman dan otomatis siap dilampirkan.
			</p>
		</div>

		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 24px;">
			<span style="font-size: 28px; display: block; margin-bottom: 12px;">🎯</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">3. Lamar Sekali Klik</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Pilih lowongan yang cocok dan kirim berkas lamaran langsung ke mitra penyelenggara.
			</p>
		</div>

		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 24px;">
			<span style="font-size: 28px; display: block; margin-bottom: 12px;">📊</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">4. Pantau Seleksi Real-time</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Ketahui progres wawancara hingga penawaran kerja (offering) secara terbuka di dashboard Anda.
			</p>
		</div>
	</div>
</section>

<!-- Section Khusus Penyelenggara / Vendor -->
<section style="background: #edf0e6; border: 1px solid var(--line); border-radius: 16px; padding: 48px 40px; display: flex; justify-content: space-between; align-items: center; gap: 32px; flex-wrap: wrap;">
	<div style="max-width: 620px;">
		<span class="eyebrow" style="margin-bottom: 8px; display: inline-block;">KEMITRAAN PENYELENGGARA & VENDOR</span>
		<h2 style="font-size: 30px; margin: 0 0 12px; color: var(--green);">
			Butuh tenaga alih daya terverifikasi untuk perusahaan Anda?
		</h2>
		<p style="color: #496347; font-size: 15px; margin: 0; line-height: 1.6;">
			Bergabunglah sebagai mitra penyelenggara resmi Upstream. Kelola lowongan kerja, akses ribuan talenta siap kerja, dan operasikan seleksi pelamar dengan ATS modern berbasis kepatuhan hukum.
		</p>
	</div>
	<div style="display: flex; gap: 14px; flex-wrap: wrap;">
		<a class="button" href="{resolve('/(app)/register')}?role=VENDOR" style="font-size: 13px; padding: 12px 20px;">
			Daftar sebagai Penyelenggara ↗
		</a>
		<a class="button secondary" href={resolve('/(public)/vendors')} style="font-size: 13px; padding: 12px 20px;">
			Direktori Mitra →
		</a>
	</div>
</section>

<!-- MODAL 1: PERMINTAAN LOGIN (Bagi Pengguna yang Belum Login) -->
{#if showAuthModal && selectedJob}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: grid; place-items: center; z-index: 1000; padding: 16px;"
	>
		<div
			style="background: white; border-radius: 14px; width: 100%; max-width: 480px; padding: 28px; box-shadow: 0 20px 45px rgba(0,0,0,0.25);"
		>
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
				<div style="display: flex; align-items: center; gap: 10px;">
					<span style="font-size: 24px;">🔒</span>
					<div>
						<h3 style="margin: 0; color: var(--green); font-size: 18px;">Masuk untuk Melamar</h3>
						<span style="font-size: 12px; color: var(--muted);">{selectedJob.title} • {selectedJob.vendor.name}</span>
					</div>
				</div>
				<button
					type="button"
					onclick={() => { showAuthModal = false; selectedJob = null; }}
					style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;"
				>
					✕
				</button>
			</div>

			<p style="font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 20px;">
				Hanya kandidat yang telah masuk / terdaftar yang dapat mengirimkan lamaran pekerjaan. Dokumen CV dan profil dari <strong>Document Vault</strong> Anda akan otomatis dilampirkan ke mitra penyelenggara.
			</p>

			<div style="display: flex; flex-direction: column; gap: 10px;">
				<a
					class="button full"
					href="{resolve('/(app)/login')}?returnTo={encodeURIComponent('/jobs/' + selectedJob.slug)}"
					style="text-align: center;"
				>
					Masuk ke Akun Pelamar ↗
				</a>
				<a
					class="button secondary full"
					href="{resolve('/(app)/register')}?role=CANDIDATE"
					style="text-align: center;"
				>
					Belum punya akun? Buat Akun Gratis →
				</a>
				<button
					type="button"
					class="text-button"
					style="margin-top: 6px; font-size: 12px;"
					onclick={() => { showAuthModal = false; selectedJob = null; }}
				>
					Kembali ke Beranda
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL 2: FORM PENGAJUAN LAMARAN CEPAT (Bagi Kandidat yang Sudah Login) -->
{#if showApplyModal && selectedJob}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: grid; place-items: center; z-index: 1000; padding: 16px;"
	>
		<div
			style="background: white; border-radius: 14px; width: 100%; max-width: 520px; padding: 28px; box-shadow: 0 20px 45px rgba(0,0,0,0.25);"
		>
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
				<div>
					<span class="eyebrow" style="margin-bottom: 4px;">PENGIRIMAN LAMARAN LANGSUNG</span>
					<h3 style="margin: 0; color: var(--green); font-size: 19px;">{selectedJob.title}</h3>
					<p class="muted" style="font-size: 13px; margin: 3px 0 0;">
						{selectedJob.vendor.name} • 📍 {selectedJob.location}
					</p>
				</div>
				<button
					type="button"
					onclick={() => { showApplyModal = false; selectedJob = null; }}
					style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;"
				>
					✕
				</button>
			</div>

			{#if applySuccess}
				<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 16px;">
					<span style="font-size: 32px; display: block; margin-bottom: 8px;">🎉</span>
					<strong style="color: #166534; font-size: 16px;">Lamaran Berhasil Terkirim!</strong>
					<p style="color: #15803d; font-size: 13px; margin: 4px 0 0;">
						Mengalihkan Anda ke tracker status lamaran...
					</p>
				</div>
			{:else}
				<!-- Info Kelengkapan Dokumen Vault -->
				<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; margin-bottom: 18px;">
					<span style="display: block; font-size: 12px; font-weight: 700; color: var(--green); margin-bottom: 8px; text-transform: uppercase;">
						Berkas dari Document Vault Anda:
					</span>
					<div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
						<div style="display: flex; justify-content: space-between; align-items: center;">
							<span>📄 CV / Resume Aktif:</span>
							{#if hasResume}
								<span style="color: #15803d; font-weight: 600;">✓ Siap dilampirkan</span>
							{:else}
								<span style="color: #dc2626; font-weight: 600;">⚠️ Belum diunggah</span>
							{/if}
						</div>
						<div style="display: flex; justify-content: space-between; align-items: center;">
							<span>🪪 Kartu Identitas (KTP):</span>
							{#if hasIdCard}
								<span style="color: #15803d; font-weight: 600;">✓ Siap dilampirkan</span>
							{:else}
								<span style="color: var(--muted); font-size: 12px;">Opsional / menyusul</span>
							{/if}
						</div>
					</div>

					{#if !hasResume}
						<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--line); font-size: 12px; color: #b91c1c;">
							Harap unggah CV Anda di Document Vault terlebih dahulu agar lamaran dapat diproses.
							<a href={resolve('/(app)/(protected)/candidate/documents')} style="text-decoration: underline; font-weight: 600; margin-left: 4px;">
								Buka Vault ↗
							</a>
						</div>
					{/if}
				</div>

				<!-- Input Surat Pengantar -->
				<div style="margin-bottom: 18px;">
					<label for="landing-cover-letter" style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--ink);">
						Surat Pengantar / Catatan untuk Recruiter (Opsional)
					</label>
					<textarea
						id="landing-cover-letter"
						bind:value={coverLetter}
						rows="3"
						placeholder="Tuliskan ringkasan pengalaman relevan atau motivasi Anda melamar posisi ini..."
						style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; font-size: 13px; resize: vertical;"
					></textarea>
				</div>

				{#if applyError}
					<div class="notice error" style="margin-bottom: 16px; font-size: 13px;">
						{applyError}
					</div>
				{/if}

				<div style="display: flex; gap: 10px;">
					<button
						type="button"
						class="button full"
						disabled={applyMutation.isPending || !hasResume}
						onclick={handleConfirmApply}
					>
						{applyMutation.isPending ? 'Mengirimkan lamaran…' : 'Kirim Lamaran Sekarang ↗'}
					</button>
					<button
						type="button"
						class="button secondary"
						onclick={() => { showApplyModal = false; selectedJob = null; }}
					>
						Batal
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

	<PublicFooter />
</div>
