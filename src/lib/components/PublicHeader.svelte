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
	let isLayananOpen = $state(false);
</script>

<header class="public-header" style="align-items: center; border-bottom: 1px solid var(--line); padding: 22px 0; margin-bottom: 32px; gap: 20px;">
	<a class="brand" href={resolve('/')}>
		<span class="brand-mark" style="font-size: 16px; letter-spacing: -1px; width: 38px; height: 38px;">GC↗</span> Go Career<span class="brand-dot">.</span>
	</a>

	<!-- 5 Menu Navigasi Publik Sesuai Spesifikasi FastTrack -->
	<nav aria-label="Navigasi publik" style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
		<a class={{ current: page.url.pathname === '/' }} href={resolve('/')}>
			Beranda
		</a>

		<!-- Dropdown Menu Layanan (Position / Study Abroad) -->
		<div class="nav-dropdown" style="position: relative; display: inline-block;">
			<button
				type="button"
				class="nav-link-dropdown-btn"
				class:current={page.url.pathname.startsWith('/layanan') || page.url.pathname.startsWith('/jobs')}
				onclick={() => (isLayananOpen = !isLayananOpen)}
				aria-expanded={isLayananOpen}
				style="background: transparent; border: none; padding: 0; font-family: inherit; font-size: 12px; color: inherit; cursor: pointer; display: flex; align-items: center; gap: 4px; line-height: inherit;"
			>
				<span>Layanan</span>
				<svg
					style="width: 12px; height: 12px; transition: transform 0.2s; {isLayananOpen ? 'transform: rotate(180deg);' : ''}"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</button>

			{#if isLayananOpen}
				<!-- Backdrop overlay for outside click -->
				<div
					role="presentation"
					style="position: fixed; inset: 0; z-index: 998;"
					onclick={() => (isLayananOpen = false)}
				></div>

				<div
					class="nav-dropdown-panel"
					style="position: absolute; top: calc(100% + 10px); left: 0; min-width: 220px; background: white; border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.12); padding: 8px; z-index: 999; display: flex; flex-direction: column; gap: 4px;"
				>
					<a
						class="dropdown-item"
						href={resolve('/(public)/layanan')}
						onclick={() => (isLayananOpen = false)}
						style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: var(--ink); font-size: 13px; font-weight: 500; transition: background 0.15s;"
					>
						<span style="font-size: 16px;">💼</span>
						<div>
							<div style="font-weight: 600; color: #111827; font-size: 13px;">Position</div>
							<div style="font-size: 11px; color: var(--muted);">Katalog formasi & lowongan karier</div>
						</div>
					</a>
					<a
						class="dropdown-item"
						href="{resolve('/(public)/layanan')}?type=study-abroad"
						onclick={() => (isLayananOpen = false)}
						style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: var(--ink); font-size: 13px; font-weight: 500; transition: background 0.15s;"
					>
						<span style="font-size: 16px;">🎓</span>
						<div>
							<div style="font-weight: 600; color: #111827; font-size: 13px;">Study Abroad</div>
							<div style="font-size: 11px; color: var(--muted);">Peluang studi & magang global</div>
						</div>
					</a>
				</div>
			{/if}
		</div>

		<a class={{ current: page.url.pathname.startsWith('/panduan') }} href={resolve('/(public)/panduan')}>
			Panduan
		</a>
		<a class={{ current: page.url.pathname.startsWith('/kontak') }} href={resolve('/(public)/kontak')}>
			Kontak
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

<style>
	.dropdown-item:hover {
		background: #f4f6f0 !important;
	}
	.nav-link-dropdown-btn:hover {
		color: var(--ink) !important;
	}
	.nav-link-dropdown-btn.current {
		font-weight: 600 !important;
		color: var(--ink) !important;
		text-decoration: underline !important;
		text-underline-offset: 8px !important;
		text-decoration-color: #90ac64 !important;
	}
</style>
