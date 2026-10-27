<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useSession } from '#lib/auth/session.svelte.ts';

	// Header publik hanya menggunakan sesi user (kandidat & penyelenggara)
	const session = useSession('user');

	const isCandidate = $derived(session.user?.role === 'CANDIDATE');
	const isVendor = $derived(session.user?.role === 'VENDOR');

	const portalHref = $derived.by(() => {
		if (isCandidate) return resolve('/(app)/(protected)/candidate');
		if (isVendor) return resolve('/(app)/(protected)/vendor');
		return resolve('/(app)/login');
	});

	const portalLabel = $derived.by(() => {
		if (isCandidate) return 'Portal Pelamar';
		if (isVendor) return 'Portal Penyelenggara';
		return 'Portal Saya';
	});

	const roleBadgeLabel = $derived.by(() => {
		if (isCandidate) return 'Pelamar';
		if (isVendor) return 'Penyelenggara';
		return 'User';
	});
</script>

<header class="public-header" style="align-items: center; border-bottom: 1px solid var(--line); padding: 22px 0; margin-bottom: 32px; gap: 20px;">
	<a class="brand" href={resolve('/')}>
		<span class="brand-mark">u↗</span> upstream<span class="brand-dot">.</span>
	</a>

	<!-- 5 Menu Utama Navigasi -->
	<nav aria-label="Navigasi publik" style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
		<a class={{ current: page.url.pathname === '/' }} href={resolve('/')}>
			Beranda
		</a>
		<a class={{ current: page.url.pathname.startsWith('/jobs') }} href={resolve('/(public)/jobs')}>
			Lowongan
		</a>
		<a class={{ current: page.url.pathname.startsWith('/vendors') }} href={resolve('/(public)/vendors')}>
			Penyelenggara
		</a>
		<a class={{ current: page.url.pathname.startsWith('/panduan') }} href={resolve('/(public)/panduan')}>
			Panduan
		</a>
		<a class={{ current: page.url.pathname.startsWith('/faq') }} href={resolve('/(public)/faq')}>
			FAQ
		</a>
	</nav>

	<!-- Akses & Status User Login: Ganti 2 Tombol Masuk/Daftar menjadi Sesi User saat login -->
	<div class="header-auth" style="display: flex; align-items: center; gap: 12px; margin-left: auto;">
		{#if session.status === 'authenticated' && session.user}
			<div class="user-chip" style="display: flex; align-items: center; gap: 8px;">
				<span
					class="avatar-badge"
					style="width: 32px; height: 32px; border-radius: 50%; background: #e7eddf; color: var(--green); display: grid; place-items: center; font-weight: 700; font-size: 13px; border: 1px solid var(--line);"
				>
					{session.user.name.charAt(0).toUpperCase()}
				</span>
				<div style="display: flex; flex-direction: column; line-height: 1.15;">
					<span style="font-size: 12px; font-weight: 600; color: var(--ink); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
						{session.user.name}
					</span>
					<span style="font-size: 9px; color: var(--green); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
						{roleBadgeLabel}
					</span>
				</div>
			</div>

			<a class="button secondary" style="font-size: 11px; padding: 8px 12px; min-height: 36px;" href={portalHref}>
				{portalLabel} ↗
			</a>

			<button
				class="text-button"
				style="font-size: 11px; color: #873e27; padding: 4px 6px;"
				onclick={() => session.logout()}
			>
				Keluar
			</button>
		{:else}
			<a class="button secondary" style="font-size: 11px; padding: 8px 14px; min-height: 36px;" href={resolve('/(app)/login')}>
				Masuk ↗
			</a>
			<a class="button primary" style="font-size: 11px; padding: 8px 14px; min-height: 36px;" href={resolve('/(app)/register')}>
				Daftar
			</a>
		{/if}
	</div>
</header>
