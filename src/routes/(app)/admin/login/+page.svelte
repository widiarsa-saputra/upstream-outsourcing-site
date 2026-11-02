<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useSession, safeDestination } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';

	const session = useSession('admin');
	let email = $state('');
	let password = $state('');
	let roleError = $state('');

	const login = createMutation(() => ({
		mutationFn: async () => {
			roleError = '';
			const result = await session.login({ email, password });
			return result;
		}
	}));

	$effect(() => {
		if (session.status === 'authenticated' && session.user) {
			const isAdmin = ['SUPERADMIN', 'TALENT_ACQUISITION', 'LEGAL'].includes(session.user.role);
			if (!isAdmin) {
				roleError = 'Akses ditolak: Akun Anda bukan akun Staf Internal atau Administrator Upstream.';
				void session.logout();
				return;
			}
			const returnTo = page.url.searchParams.get('returnTo');
			void goto(safeDestination(returnTo, session.user), { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Masuk Admin & Internal Console — Upstream</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="auth-page" style="background: #112822; min-height: 100vh; display: grid; grid-template-columns: minmax(320px, 420px) 1fr;">
	<!-- Left Side: Internal Identity Panel -->
	<aside style="background: #0d1f1a; border-right: 1px solid #1c3d33; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; color: white;">
		<div>
			<a class="brand" href={resolve('/')} style="color: white;">
				<span class="brand-mark" style="background: var(--accent); color: #0d1f1a;">u↗</span> upstream.
			</a>
			<div style="margin-top: 64px;">
				<span class="eyebrow" style="color: var(--accent); letter-spacing: 2px;">INTERNAL CONSOLE ACCESS</span>
				<h2 style="font-size: 2.2rem; line-height: 1.2; margin: 12px 0 16px; color: #f2f7f0;">
					Pusat Kontrol & Operasional Platform.
				</h2>
				<p style="color: #9cb1a6; font-size: 14px; line-height: 1.6;">
					Khusus tim Superadmin, Talent Acquisition, dan Tim Legal/Compliance Upstream untuk verifikasi berkas, moderasi lowongan, dan kurasi alur seleksi.
				</p>
			</div>
		</div>

		<div>
			<span style="font-size: 11px; color: #627c71; letter-spacing: 1.5px; font-weight: 700;">
				PROTECTED MANAGEMENT AREA • UPSTREAM V1.0
			</span>
		</div>
	</aside>

	<!-- Right Side: Login Form -->
	<main style="display: grid; place-items: center; padding: 32px; background: #16322b;">
		<div style="width: 100%; max-width: 440px; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);">
			<div style="margin-bottom: 24px;">
				<span class="eyebrow" style="color: var(--green); margin-bottom: 4px;">SECURE STAFF LOGIN</span>
				<h1 style="font-size: 1.8rem; margin: 0; color: var(--green); font-weight: 600;">
					Login Staf Internal
				</h1>
				<p class="muted" style="font-size: 13px; margin: 6px 0 0;">
					Masukkan kredensial akun staf internal yang telah terdaftar.
				</p>
			</div>

			{#if roleError}
				<div class="notice error" role="alert" style="margin-bottom: 20px;">
					<p>{roleError}</p>
				</div>
			{/if}

			{#if login.isError}
				<div class="notice error" role="alert" style="margin-bottom: 20px;">
					<p>{errorMessage(login.error)}</p>
				</div>
			{/if}

			<form
				onsubmit={(event) => {
					event.preventDefault();
					login.mutate();
				}}
				style="display: flex; flex-direction: column; gap: 16px;"
			>
				<div>
					<label for="admin-email" style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--ink);">
						Email Staf Internal
					</label>
					<input
						id="admin-email"
						type="email"
						autocomplete="username"
						bind:value={email}
						required
						placeholder="staf@upstream.id"
						style="width: 100%; padding: 11px 14px; border: 1px solid var(--line); border-radius: 8px; font-size: 14px;"
					/>
				</div>

				<div>
					<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
						<label for="admin-password" style="font-size: 13px; font-weight: 600; color: var(--ink);">
							Password
						</label>
					</div>
					<input
						id="admin-password"
						type="password"
						autocomplete="current-password"
						bind:value={password}
						required
						maxlength="128"
						placeholder="••••••••••••"
						style="width: 100%; padding: 11px 14px; border: 1px solid var(--line); border-radius: 8px; font-size: 14px;"
					/>
				</div>

				<button
					class="button full primary"
					disabled={login.isPending || session.status === 'initializing'}
					style="margin-top: 8px; padding: 12px; font-weight: 600; font-size: 14px; background: var(--green); color: white;"
				>
					{login.isPending ? 'Mengautentikasi Staf…' : 'Masuk ke Konsol Staf ↗'}
				</button>
			</form>

			<div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #edf1e8; text-align: center;">
				<p class="muted" style="font-size: 12px; margin: 0;">
					Bukan staf atau administrator? <br />
					<a href={resolve('/(app)/login')} class="text-link" style="font-weight: 600; color: var(--green);">
						← Beralih ke Portal Pengguna & Mitra
					</a>
				</p>
			</div>
		</div>
	</main>
</div>
