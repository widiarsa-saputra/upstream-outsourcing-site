<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery, createMutation } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import { candidateDocumentLabels, type CandidateProfile } from '#lib/candidate/types.ts';

	const session = useSession();

	const profileQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'profile'],
		enabled: !!session.user?.id,
		queryFn: ({ signal }) => session.api.request<CandidateProfile>('/candidate/profile', { signal })
	}));

	const resend = createMutation(() => ({
		mutationFn: () =>
			session.api.request<{ message: string }>('/auth/resend-verification', {
				method: 'POST',
				anonymous: true,
				body: JSON.stringify({ email: session.user?.email })
			})
	}));

	const profileCompleted = $derived.by(() => {
		const p = profileQuery.data;
		if (!p) return 0;
		let score = 0;
		if (p.headline) score += 20;
		if (p.phone && p.location) score += 20;
		if (p.bio) score += 20;
		if (p.experiences && p.experiences.length > 0) score += 20;
		if (p.educations && p.educations.length > 0) score += 10;
		if (p.skills && p.skills.length > 0) score += 10;
		return Math.min(score, 100);
	});

	const docsCount = $derived.by(() => {
		const docs = profileQuery.data?.documents || [];
		const uploadedTypes = new Set(docs.map((d) => d.type));
		const required = Object.entries(candidateDocumentLabels).filter(([_, conf]) => conf.required);
		const fulfilled = required.filter(([type]) => uploadedTypes.has(type as any)).length;
		return {
			fulfilled,
			total: required.length,
			verified: docs.filter((d) => d.verificationStatus === 'verified').length
		};
	});
</script>

<svelte:head>
	<title>Ringkasan Kandidat — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">PORTAL KANDIDAT</p>
		<h1>Selamat datang,<br /><em>{session.user?.name || 'Talenta Upstream'}.</em></h1>
		<p class="lead">
			Lengkapi CV digital dan unggah berkas wajib Anda agar profil siap dikurasi dan disalurkan ke mitra kerja alih daya.
		</p>
	</div>
</div>

{#if !session.user?.emailVerified}
	<div class="notice">
		<p><strong>Verifikasi email Anda belum selesai.</strong> Segera verifikasi agar akun dapat menerima notifikasi panggilan kerja.</p>
		<button class="text-button" disabled={resend.isPending} onclick={() => resend.mutate()}>
			{resend.isPending ? 'Mengirim tautan…' : 'Kirim ulang tautan verifikasi →'}
		</button>
		{#if resend.isSuccess}
			<p role="status" style="margin-top: 8px; color: var(--green); font-weight: 600;">{resend.data.message}</p>
		{/if}
	</div>
{/if}

{#if profileQuery.isPending}
	<div class="notice" role="status">Memuat data profil kandidat…</div>
{:else if profileQuery.isError}
	<div class="notice error" role="alert">{errorMessage(profileQuery.error)}</div>
{:else}
	<div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 24px 0;">
		<div class="panel" style="padding: 20px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px;">
			<span class="eyebrow" style="margin-bottom: 8px;">KELENGKAPAN PROFIL</span>
			<div style="display: flex; align-items: baseline; gap: 8px; margin: 8px 0;">
				<h2 style="font-size: 2.2rem; margin: 0; color: var(--green);">{profileCompleted}%</h2>
				<span class="muted">{profileCompleted === 100 ? 'Siap disalurkan' : 'Perlu dilengkapi'}</span>
			</div>
			<div style="background: #eef2eb; border-radius: 999px; height: 6px; overflow: hidden; margin-bottom: 14px;">
				<div style="background: var(--green); width: {profileCompleted}%; height: 100%; transition: width 0.3s ease;"></div>
			</div>
			<a class="button secondary small" href={resolve('/(app)/(protected)/candidate/profile')}>
				Perbarui Profil →
			</a>
		</div>

		<div class="panel" style="padding: 20px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px;">
			<span class="eyebrow" style="margin-bottom: 8px;">DOCUMENT VAULT</span>
			<div style="display: flex; align-items: baseline; gap: 8px; margin: 8px 0;">
				<h2 style="font-size: 2.2rem; margin: 0; color: var(--green);">{docsCount.fulfilled} / {docsCount.total}</h2>
				<span class="muted">Berkas wajib</span>
			</div>
			<p class="muted" style="font-size: 13px; margin-bottom: 14px;">
				{docsCount.verified} berkas telah terverifikasi oleh tim internal.
			</p>
			<a class="button secondary small" href={resolve('/(app)/(protected)/candidate/documents')}>
				Buka Vault Dokumen →
			</a>
		</div>

		<div class="panel" style="padding: 20px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px;">
			<span class="eyebrow" style="margin-bottom: 8px;">LOWONGAN TERSEDIA</span>
			<div style="margin: 8px 0;">
				<h2 style="font-size: 2.2rem; margin: 0; color: var(--green);">Aktif</h2>
				<p class="muted" style="font-size: 13px; margin: 8px 0 14px;">Jelajahi lowongan alih daya dan rekrutmen terbaru.</p>
			</div>
			<a class="button secondary small" href={resolve('/(public)/jobs')}>
				Lihat Lowongan ↗
			</a>
		</div>
	</div>

	<div class="panel" style="margin-top: 24px;">
		<h2>Langkah berikutnya menuju penyaluran kerja:</h2>
		<ol style="padding-left: 20px; line-height: 1.8; color: var(--ink);">
			<li><strong>Lengkapi CV Digital:</strong> Tuliskan pengalaman kerja, pendidikan, serta keahlian utama Anda.</li>
			<li><strong>Unggah Dokumen Wajib:</strong> Siapkan KTP, CV/Resume PDF, dan Ijazah untuk verifikasi keabsahan data.</li>
			<li><strong>Kurasi Internal:</strong> Tim Talent Acquisition Upstream akan meninjau dan memvalidasi berkas Anda dalam waktu 1x24 jam kerja.</li>
			<li><strong>Lamar & Wawancara:</strong> Lamar lowongan yang sesuai kualifikasi dan pantau status pemanggilan wawancara mitra alih daya.</li>
		</ol>
	</div>
{/if}
