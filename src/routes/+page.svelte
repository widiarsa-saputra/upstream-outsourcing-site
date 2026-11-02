<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
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

	// ==================== SLIDER BERANDA (HERO CAROUSEL) ====================
	let currentSlide = $state(0);
	const heroSlides = [
		{
			badge: 'PROGRAM KARIER & PENEMPATAN RESMI',
			title: 'Akselerasi Karier Profesional Bersama Mitra Terpercaya',
			subtitle: 'Ratusan formasi kerja alih daya langsung dari mitra korporasi terverifikasi dengan kontrak kerja transparan dan kepatuhan hukum penuh.',
			tag: 'Peluang Terverifikasi',
			icon: '🌟'
		},
		{
			badge: 'DOCUMENT VAULT & DIGITAL CV',
			title: 'Satu Kali Unggah Berkas, Lamar Berbagai Peluang',
			subtitle: 'Simpan CV, KTP, dan portofolio Anda di brankas terenkripsi. Berkas otomatis terlampir saat Anda mendaftar program tanpa repot unggah ulang.',
			tag: 'Hemat Waktu & Aman',
			icon: '🔒'
		},
		{
			badge: 'ZERO PLACEMENT FEE GUARANTEE',
			title: '100% Bebas Biaya Pungutan bagi Semua Pencari Kerja',
			subtitle: 'Tanpa calo, tanpa potongan gaji. Setiap talenta berhak mendapatkan akses kesempatan kerja yang adil, setara, dan terlindungi.',
			tag: 'Zero Fee',
			icon: '🤝'
		}
	];

	function nextSlide() {
		currentSlide = (currentSlide + 1) % heroSlides.length;
	}

	function prevSlide() {
		currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
	}

	function goToSlide(index: number) {
		currentSlide = index;
	}

	// ==================== SEARCH FINDER BERANDA ====================
	let searchKeyword = $state('');
	let searchCategory = $state('');

	function handleHeroSearch(e: SubmitEvent) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (searchKeyword.trim()) params.set('q', searchKeyword.trim());
		if (searchCategory.trim()) params.set('industry', searchCategory.trim());
		void goto(`${resolve('/(public)/layanan')}?${params.toString()}`);
	}

	// ==================== DATA TESTIMONI ====================
	const testimonials = [
		{
			name: 'Rizky Fauzi Pratama',
			role: 'Staff Logistik & Inventori',
			company: 'Mitra Logistik Nusantara Prima',
			avatar: 'R',
			avatarBg: '#dcfce7',
			avatarColor: '#166534',
			rating: 5,
			quote:
				'Proses pendaftaran sangat transparan dan cepat. Setelah upload CV di Document Vault, dalam 3 hari saya langsung dipanggil interview. Benar-benar zero fee tanpa biaya calo sedikit pun.'
		},
		{
			name: 'Ni Made Anindya Putri',
			role: 'Customer Support Specialist',
			company: 'Mitra PT Global Solusindo',
			avatar: 'N',
			avatarBg: '#e0f2fe',
			avatarColor: '#0369a1',
			rating: 5,
			quote:
				'Sistem pelacakannya sangat rapi. Dari pengiriman lamaran, review berkas, hingga offering letter semuanya terpantau jelas di dashboard kandidat. Sangat profesional!'
		},
		{
			name: 'Ahmad Faisal',
			role: 'Teknisi Operasional Lapangan',
			company: 'Mitra Energi Jaya Sentosa',
			avatar: 'A',
			avatarBg: '#fef3c7',
			avatarColor: '#92400e',
			rating: 5,
			quote:
				'Fitur pencarian dan filter program sangat memudahkan menemukan posisi yang pas dengan keahlian saya. Sekarang saya sudah bekerja kontrak resmi dengan benefit yang jelas.'
		}
	];

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

	function getStageToneStyle(tone: string): string {
		switch (tone) {
			case 'success':
				return 'background: #dcfce7; color: #15803d;';
			case 'pending':
				return 'background: #fef3c7; color: #92400e;';
			case 'danger':
				return 'background: #fee2e2; color: #b91c1c;';
			case 'info':
				return 'background: #e0f2fe; color: #0369a1;';
			case 'neutral':
			default:
				return 'background: #f1f5f9; color: #475569;';
		}
	}

	const canonicalUrl = $derived(`${page.url.origin}${page.url.pathname}`);
	const shareImage = $derived(`${page.url.origin}${favicon}`);
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'WebSite',
					'@id': `${page.url.origin}/#website`,
					url: page.url.origin,
					name: 'Upstream',
					description:
						'Platform alih daya dan rekrutmen kerja terverifikasi di Indonesia dengan digital CV dan zero placement fee.',
					inLanguage: 'id-ID',
					potentialAction: {
						'@type': 'SearchAction',
						target: `${page.url.origin}/jobs?q={search_term_string}`,
						'query-input': 'required name=search_term_string'
					}
				},
				{
					'@type': 'Organization',
					'@id': `${page.url.origin}/#organization`,
					name: 'Upstream',
					url: page.url.origin,
					logo: shareImage,
					description:
						'Platform alih daya dan rekrutmen kerja terverifikasi di Indonesia. Jelajahi lowongan resmi mitra terverifikasi, digital CV, dan jaminan zero placement fee.'
				}
			]
		})
	);
</script>

<svelte:head>
	<title>Upstream — Platform Alih Daya & Rekrutmen Talenta Terverifikasi</title>
	<meta
		name="description"
		content="Platform alih daya dan rekrutmen kerja terverifikasi di Indonesia. Jelajahi lowongan resmi mitra perusahaan, digital CV, dan jaminan zero placement fee."
	/>
	<meta
		name="keywords"
		content="outsourcing terpercaya, alih daya indonesia, lowongan kerja terverifikasi, rekrutmen talenta, digital cv, zero placement fee, karir upstream"
	/>
	<meta name="author" content="Upstream" />
	<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Upstream" />
	<meta property="og:title" content="Upstream — Platform Alih Daya & Rekrutmen Talenta Terverifikasi" />
	<meta
		property="og:description"
		content="Platform alih daya dan rekrutmen kerja terverifikasi di Indonesia. Jelajahi lowongan resmi mitra perusahaan, digital CV, dan jaminan zero placement fee."
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={shareImage} />
	<meta property="og:locale" content="id_ID" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Upstream — Platform Alih Daya & Rekrutmen Talenta Terverifikasi" />
	<meta
		name="twitter:description"
		content="Platform alih daya dan rekrutmen kerja terverifikasi di Indonesia. Jelajahi lowongan resmi mitra perusahaan, digital CV, dan jaminan zero placement fee."
	/>
	<meta name="twitter:image" content={shareImage} />

	<!-- Structured Data (JSON-LD) -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLd}</${'script'}>`}
</svelte:head>

<div class="public-site">
	<PublicHeader />

	<!-- Hero Section -->
	<section class="landing-main" style="padding: 20px 0 60px;">
		<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
			<div>
				<p class="eyebrow" style="margin-bottom: 8px;">GO CAREER • PLATFORM ALIH DAYA & PENEMPATAN TALENTA</p>
				<h1 style="font-size: clamp(2.6rem, 5.5vw, 4.5rem); line-height: 1.1; max-width: 900px; margin-bottom: 16px;">
					Langkah berikutnya,<br /><em>bersama ekosistem terpercaya.</em>
				</h1>
				<p class="lead" style="max-width: 740px; margin-bottom: 0; font-size: 17px; color: var(--muted); line-height: 1.6;">
					Ruang aman dan terverifikasi bertemunya talenta terbaik dengan mitra penyelenggara kerja resmi. Susun Digital CV, amankan berkas di Document Vault terenkripsi, dan lamar peluang tanpa perantara.
				</p>
			</div>
			<div class="actions" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
				{#if !session.user}
					<a class="button primary" href={resolve('/(app)/register')}>Daftar sebagai Pelamar ↗</a>
					<a class="button secondary" href="{resolve('/(app)/register')}?role=VENDOR">Kemitraan Penyelenggara →</a>
				{:else if session.user.role === 'CANDIDATE'}
					<a class="button primary" href="#user-dashboard">Dashboard Pelamar Saya ↓</a>
					<a class="button secondary" href={resolve('/(app)/(protected)/candidate/profile')}>Edit Digital CV ↗</a>
				{:else if session.user.role === 'VENDOR'}
					<a class="button primary" href={resolve('/(app)/(protected)/vendor')}>Buka Portal Penyelenggara ↗</a>
				{/if}
			</div>
		</div>

		<!-- ==================== HERO SLIDER CAROUSEL ==================== -->
		<div
			class="hero-slider"
			style="position: relative; background: linear-gradient(135deg, #153f35 0%, #1e5246 100%); border-radius: 18px; padding: 36px 40px; color: white; margin-bottom: 28px; box-shadow: 0 10px 30px rgba(21,63,53,0.18); overflow: hidden; min-height: 200px; display: flex; flex-direction: column; justify-content: space-between;"
		>
			<!-- Decorative Background Glow -->
			<div style="position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; background: rgba(198, 239, 117, 0.15); border-radius: 50%; filter: blur(50px); pointer-events: none;"></div>
			<div style="position: absolute; bottom: -40px; left: 30%; width: 180px; height: 180px; background: rgba(255, 255, 255, 0.06); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>

			<div style="position: relative; z-index: 2;">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
					<span style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--accent);">
						{heroSlides[currentSlide].icon} {heroSlides[currentSlide].badge}
					</span>
					<span style="font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500;">
						{currentSlide + 1} / {heroSlides.length}
					</span>
				</div>

				<h2 style="font-size: clamp(1.4rem, 2.5vw, 2rem); color: white; margin-bottom: 10px; font-weight: 600; line-height: 1.25; max-width: 780px;">
					{heroSlides[currentSlide].title}
				</h2>
				<p style="color: rgba(255,255,255,0.85); font-size: 14px; max-width: 720px; line-height: 1.6; margin-bottom: 20px;">
					{heroSlides[currentSlide].subtitle}
				</p>
			</div>

			<!-- Slider Controls & Dots -->
			<div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 16px; margin-top: 8px; flex-wrap: wrap; gap: 14px;">
				<div style="display: flex; gap: 8px; align-items: center;">
					{#each heroSlides as _, idx}
						<button
							type="button"
							aria-label="Pilih Slide {idx + 1}"
							onclick={() => goToSlide(idx)}
							style="width: {currentSlide === idx ? '28px' : '9px'}; height: 9px; border-radius: 999px; background: {currentSlide === idx ? 'var(--accent)' : 'rgba(255,255,255,0.3)'}; border: none; cursor: pointer; transition: all 0.25s ease;"
						></button>
					{/each}
				</div>

				<div style="display: flex; gap: 8px; align-items: center;">
					<button
						type="button"
						aria-label="Slide Sebelumnya"
						onclick={prevSlide}
						style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.2); display: grid; place-items: center; font-size: 14px; cursor: pointer;"
					>
						←
					</button>
					<button
						type="button"
						aria-label="Slide Berikutnya"
						onclick={nextSlide}
						style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.2); display: grid; place-items: center; font-size: 14px; cursor: pointer;"
					>
						→
					</button>
					<a
						class="button secondary small"
						href="#daftar-lowongan"
						style="font-size: 11px; padding: 6px 14px; background: rgba(255,255,255,0.92); color: var(--green); border: none; font-weight: 600;"
					>
						Jelajahi Posisi ↓
					</a>
				</div>
			</div>
		</div>

		<!-- ==================== SEARCH FINDER BERANDA (KEY SEARCH: NAMA PROGRAM / LABEL) ==================== -->
		<form
			onsubmit={handleHeroSearch}
			style="background: white; border: 1px solid var(--line); border-radius: 14px; padding: 18px 24px; box-shadow: 0 6px 20px rgba(0,0,0,0.04); margin-bottom: 36px;"
		>
			<div style="display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap;">
				<div style="flex: 2; min-width: 240px;">
					<label for="hero-search-keyword" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
						🔍 Posisi atau Nama Program
					</label>
					<input
						id="hero-search-keyword"
						type="text"
						bind:value={searchKeyword}
						placeholder="Contoh: Staff Logistik, IT Developer, Administrasi..."
						style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; font-size: 14px;"
					/>
				</div>

				<div style="flex: 1.2; min-width: 180px;">
					<label for="hero-search-category" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
						🏷️ Label / Bidang Industri
					</label>
					<select
						id="hero-search-category"
						bind:value={searchCategory}
						style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; font-size: 14px; background: white;"
					>
						<option value="">Semua Kategori & Bidang</option>
						<option value="Teknologi Informasi">Teknologi & Digital</option>
						<option value="Logistik">Logistik & Distribusi</option>
						<option value="Manufaktur">Manufaktur & Operasional</option>
						<option value="Perhotelan">Layanan & Hospitality</option>
						<option value="Administrasi">Administrasi & Keuangan</option>
					</select>
				</div>

				<button
					type="submit"
					class="button primary"
					style="min-height: 42px; padding: 0 24px; font-size: 13px; font-weight: 600; justify-content: center;"
				>
					Cari Program ↗
				</button>
			</div>
		</form>

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
										style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; white-space: nowrap; {getStageToneStyle(stage.tone)}"
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
		<a class="button secondary" href={resolve('/(public)/layanan')}>
			Lihat Semua Layanan Program ({data.jobs.total}) ↗
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
						<a href={resolve('/(public)/layanan/[slug]', { slug: job.slug })} style="color: var(--ink); text-decoration: none;">
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
							href={resolve('/(public)/layanan/[slug]', { slug: job.slug })}
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

<!-- ==================== SECTION KEUNTUNGAN APLIKASI (BENEFITS) ==================== -->
<section style="background: white; border: 1px solid var(--line); border-radius: 16px; padding: 48px 40px; margin-bottom: 40px; box-shadow: 0 6px 20px rgba(0,0,0,0.02);">
	<div style="max-width: 720px; margin-bottom: 36px;">
		<p class="eyebrow" style="margin-bottom: 6px;">KEUNTUNGAN BAGI TALENTA & KANDIDAT</p>
		<h2 style="font-size: 32px; margin: 0 0 10px; color: var(--ink);">Mengapa memilih platform kami?</h2>
		<p style="color: var(--muted); font-size: 15px; margin: 0; line-height: 1.6;">
			Kami merancang ekosistem alih daya kerja yang melindungi hak pencari kerja dengan efisiensi tinggi, transparansi penuh, dan kepatuhan hukum ketenagakerjaan RI.
		</p>
	</div>

	<!-- 4 Pilar Keuntungan Utama -->
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 36px;">
		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<span style="font-size: 32px; display: block; margin-bottom: 12px;">🛡️</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">Document Vault Terenkripsi</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Cukup satu kali unggah CV dan berkas identitas Anda. Data aman dan otomatis siap dilampirkan ke berbagai formasi kerja.
			</p>
		</div>

		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<span style="font-size: 32px; display: block; margin-bottom: 12px;">💸</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">Zero Placement Fee (100% Gratis)</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Tanpa pungutan biaya apa pun, tanpa calo, dan tanpa potongan gaji penempatan. Seluruh akses sepenuhnya bebas biaya.
			</p>
		</div>

		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<span style="font-size: 32px; display: block; margin-bottom: 12px;">🏢</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">Mitra Terverifikasi Legalitas</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Seluruh perusahaan mitra telah melewati proses verifikasi NIB, NPWP, dan perizinan berusaha sebelum dapat membuka lowongan.
			</p>
		</div>

		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<span style="font-size: 32px; display: block; margin-bottom: 12px;">📈</span>
			<strong style="display: block; font-size: 16px; color: var(--green); margin-bottom: 8px;">Pelacakan Seleksi Real-Time</strong>
			<p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0;">
				Ketahui setiap tahapan secara langsung: kurasi berkas, interview teknis, offering letter, hingga penempatan resmi.
			</p>
		</div>
	</div>

	<!-- 4 Langkah Alur Meniti Karier -->
	<div style="border-top: 1px dashed var(--line); padding-top: 32px;">
		<span class="eyebrow" style="margin-bottom: 16px; display: block;">ALUR TAHAPAN PENEMPATAN</span>
		<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
			<div style="display: flex; gap: 12px; align-items: flex-start;">
				<span style="background: #e7eddf; color: var(--green); font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">1</span>
				<div>
					<strong style="font-size: 13px; color: var(--ink); display: block;">Profil & Digital CV</strong>
					<span style="font-size: 12px; color: var(--muted);">Daftar akun & lengkapi data keahlian.</span>
				</div>
			</div>

			<div style="display: flex; gap: 12px; align-items: flex-start;">
				<span style="background: #e7eddf; color: var(--green); font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">2</span>
				<div>
					<strong style="font-size: 13px; color: var(--ink); display: block;">Amankan Berkas di Vault</strong>
					<span style="font-size: 12px; color: var(--muted);">Unggah CV dan identitas KTP.</span>
				</div>
			</div>

			<div style="display: flex; gap: 12px; align-items: flex-start;">
				<span style="background: #e7eddf; color: var(--green); font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">3</span>
				<div>
					<strong style="font-size: 13px; color: var(--ink); display: block;">Lamar Sekali Klik</strong>
					<span style="font-size: 12px; color: var(--muted);">Pilih posisi & kirim berkas instan.</span>
				</div>
			</div>

			<div style="display: flex; gap: 12px; align-items: flex-start;">
				<span style="background: #e7eddf; color: var(--green); font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">4</span>
				<div>
					<strong style="font-size: 13px; color: var(--ink); display: block;">Pantau Progres Seleksi</strong>
					<span style="font-size: 12px; color: var(--muted);">Notifikasi status wawancara & offering.</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ==================== SECTION TESTIMONI PENGGUNA ==================== -->
<section style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 16px; padding: 48px 40px; margin-bottom: 40px;">
	<div style="max-width: 680px; margin-bottom: 32px;">
		<p class="eyebrow" style="margin-bottom: 6px;">KATA ALUMNI & TALENTA KAMI</p>
		<h2 style="font-size: 30px; margin: 0 0 8px; color: var(--ink);">Kisah sukses bermula di sini.</h2>
		<p style="color: var(--muted); font-size: 14px; margin: 0; line-height: 1.6;">
			Dengarkan pengalaman para talenta yang telah menemukan langkah karier terbaik bersama mitra penyelenggara resmi.
		</p>
	</div>

	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
		{#each testimonials as item}
			<div
				style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 26px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02);"
			>
				<div>
					<div style="display: flex; gap: 4px; color: #f59e0b; font-size: 14px; margin-bottom: 14px;">
						{'★'.repeat(item.rating)}
					</div>
					<p style="font-size: 13px; color: #334e44; line-height: 1.65; margin: 0 0 20px; font-style: italic;">
						“{item.quote}”
					</p>
				</div>

				<div style="display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--line); padding-top: 14px;">
					<span
						style="width: 40px; height: 40px; border-radius: 50%; background: {item.avatarBg}; color: {item.avatarColor}; display: grid; place-items: center; font-weight: 700; font-size: 15px;"
					>
						{item.avatar}
					</span>
					<div>
						<strong style="font-size: 13px; color: var(--ink); display: block;">{item.name}</strong>
						<span style="font-size: 11px; color: var(--muted); display: block;">
							{item.role} • <span style="color: var(--green);">{item.company}</span>
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- ==================== SECTION ENGAGEMENT (MOTTO & JARGON) ==================== -->
<section
	style="position: relative; background: linear-gradient(135deg, #153f35 0%, #0d2b24 100%); border-radius: 18px; padding: 56px 48px; color: white; margin-bottom: 40px; overflow: hidden; box-shadow: 0 14px 34px rgba(21,63,53,0.22);"
>
	<!-- Decorative Accents -->
	<div style="position: absolute; top: -40px; right: -40px; width: 260px; height: 260px; background: rgba(198,239,117,0.12); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
	<div style="position: absolute; bottom: -40px; left: -40px; width: 220px; height: 220px; background: rgba(255,255,255,0.05); border-radius: 50%; filter: blur(50px); pointer-events: none;"></div>

	<div style="position: relative; z-index: 2; max-width: 820px;">
		<span
			style="display: inline-block; background: rgba(255,255,255,0.12); color: var(--accent); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px;"
		>
			✦ KOMITMEN KARIER MASA DEPAN
		</span>

		<!-- Motto / Jargon Utama -->
		<h2 style="font-size: clamp(2rem, 4vw, 3.2rem); color: white; font-weight: 600; line-height: 1.15; margin-bottom: 16px; letter-spacing: -0.02em;">
			Membuka Peluang Nyata,<br />
			<em style="color: var(--accent); font-family: Georgia, serif;">mengantarkan Anda ke potensi terbaik.</em>
		</h2>

		<p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 1.65; max-width: 680px; margin-bottom: 32px;">
			Jadikan keahlian Anda bernilai di tempat yang tepat. Dapatkan pendampingan fase seleksi, kepastian kontrak yang patuh regulasi, dan fasilitas brankas digital tanpa dipungut biaya perantara.
		</p>

		<div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
			<a
				class="button"
				href={resolve('/(public)/layanan')}
				style="background: var(--accent); color: var(--green); font-weight: 700; font-size: 13px; padding: 12px 24px; border: none;"
			>
				Jelajahi Semua Layanan & Posisi ↗
			</a>
			{#if !session.user}
				<a
					class="button secondary"
					href={resolve('/(app)/register')}
					style="background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.3); font-size: 13px; padding: 12px 22px;"
				>
					Daftar Akun Gratis Sekarang
				</a>
			{/if}
			<a
				class="text-link"
				href={resolve('/(public)/kontak')}
				style="font-size: 13px; color: var(--accent); font-weight: 600; text-decoration: underline;"
			>
				Pusat Konsultasi & Bantuan →
			</a>
		</div>
	</div>
</section>

<!-- Section Khusus Penyelenggara / Vendor -->
<section style="background: #edf0e6; border: 1px solid var(--line); border-radius: 16px; padding: 48px 40px; display: flex; justify-content: space-between; align-items: center; gap: 32px; flex-wrap: wrap; margin-bottom: 60px;">
	<div style="max-width: 620px;">
		<span class="eyebrow" style="margin-bottom: 8px; display: inline-block;">KEMITRAAN PENYELENGGARA & VENDOR</span>
		<h2 style="font-size: 30px; margin: 0 0 12px; color: var(--green);">
			Butuh tenaga alih daya terverifikasi untuk perusahaan Anda?
		</h2>
		<p style="color: #496347; font-size: 15px; margin: 0; line-height: 1.6;">
			Bergabunglah sebagai mitra penyelenggara resmi Go Career / Upstream. Kelola lowongan kerja, akses ribuan talenta siap kerja, dan operasikan seleksi pelamar dengan ATS modern berbasis kepatuhan hukum.
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
