<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AuthFrame from '#lib/components/AuthFrame.svelte';
	import { useSession, safeDestination } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';

	const session = useSession();
	let email = $state('');
	let password = $state('');

	// Pilihan tab peran: Pelamar vs Penyelenggara/Vendor
	let loginType = $state<'CANDIDATE' | 'VENDOR'>(
		page.url.searchParams.get('portal') === 'vendor' || page.url.searchParams.get('role') === 'VENDOR'
			? 'VENDOR'
			: 'CANDIDATE'
	);

	const login = createMutation(() => ({ mutationFn: () => session.login({ email, password }) }));

	const providers = createQuery(() => ({
		queryKey: ['auth', 'providers'],
		queryFn: ({ signal }) =>
			session.api.request<{ google: boolean }>('/auth/providers', { anonymous: true, signal }),
		retry: false
	}));

	const google = createMutation(() => ({
		mutationFn: async () => {
			const result = await session.api.request<{ url: string }>('/auth/google/authorize', {
				anonymous: true
			});
			window.location.assign(result.url);
		}
	}));

	$effect(() => {
		if (session.status === 'authenticated' && session.user)
			void goto(safeDestination(page.url.searchParams.get('returnTo'), session.user), {
				replaceState: true
			});
	});
</script>

<svelte:head>
	<title>{loginType === 'VENDOR' ? 'Masuk Penyelenggara / Mitra' : 'Masuk Pelamar'} — Upstream</title>
</svelte:head>

<AuthFrame
	title={loginType === 'VENDOR' ? 'Portal Penyelenggara Kerja.' : 'Masuk ke portal.'}
	subtitle={loginType === 'VENDOR'
		? 'Kelola formasi lowongan alih daya dan seleksi talenta perusahaan Anda.'
		: 'Lanjutkan perjalanan karier Anda bersama Upstream.'}
>
	<!-- Tab Pilihan: Pelamar Kerja vs Penyelenggara / Mitra -->
	<div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
		<button
			type="button"
			class="button {loginType === 'CANDIDATE' ? 'primary' : 'secondary'}"
			style="font-size: 12px; padding: 7px 12px; border-radius: 6px; flex: 1; min-height: 36px;"
			onclick={() => (loginType = 'CANDIDATE')}
		>
			👤 Pelamar Kerja
		</button>
		<button
			type="button"
			class="button {loginType === 'VENDOR' ? 'primary' : 'secondary'}"
			style="font-size: 12px; padding: 7px 12px; border-radius: 6px; flex: 1; min-height: 36px;"
			onclick={() => (loginType = 'VENDOR')}
		>
			🏢 Penyelenggara (Mitra)
		</button>
	</div>

	{#if loginType === 'VENDOR'}
		<div style="background: #edf0e6; border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; margin-bottom: 18px; font-size: 12px; color: #3d5642; line-height: 1.5;">
			<strong>Akses Mitra Penyelenggara:</strong> Masuk untuk mempublikasikan lowongan, memeriksa berkas CV pelamar, dan mengatur jadwal seleksi alih daya.
		</div>
	{/if}

	<form
		onsubmit={(event) => {
			event.preventDefault();
			login.mutate();
		}}
	>
		<label for="email">Alamat email {loginType === 'VENDOR' ? 'PIC / Perusahaan' : 'Anda'}</label>
		<input
			id="email"
			type="email"
			autocomplete="email"
			bind:value={email}
			required
			placeholder={loginType === 'VENDOR' ? 'pic@perusahaan.co.id' : 'nama@email.com'}
		/>

		<div class="label-row">
			<label for="password">Password</label>
			<a href={resolve('/(app)/forgot-password')}>Lupa password?</a>
		</div>
		<input
			id="password"
			type="password"
			autocomplete="current-password"
			bind:value={password}
			required
			maxlength="128"
			placeholder="Masukkan password Anda"
		/>

		{#if login.isError}<p class="notice error" role="alert">{errorMessage(login.error)}</p>{/if}

		<button class="button full" disabled={login.isPending || session.status === 'initializing'}>
			{login.isPending
				? 'Memeriksa akun…'
				: loginType === 'VENDOR'
					? 'Masuk ke Portal Penyelenggara'
					: 'Masuk ke Portal Pelamar'} <span>↗</span>
		</button>
	</form>

	{#if session.status === 'error'}
		<p class="notice error" role="alert">{session.error}</p>
		<button class="text-button" onclick={() => session.bootstrap()}>Periksa koneksi kembali</button>
	{/if}

	{#if providers.data?.google && loginType === 'CANDIDATE'}
		<div class="divider">atau</div>
		<button
			class="button secondary full"
			disabled={google.isPending}
			onclick={() => google.mutate()}
		>
			Lanjutkan dengan Google
		</button>
	{/if}
	{#if google.isError}<p class="notice error" role="alert">{errorMessage(google.error)}</p>{/if}

	<!-- Pilihan Registrasi Berdasarkan Peran -->
	{#if loginType === 'VENDOR'}
		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 16px; margin-top: 24px; text-align: center;">
			<p style="font-size: 13px; color: var(--muted); margin: 0 0 10px;">
				Perusahaan Anda belum terdaftar sebagai penyelenggara kerja?
			</p>
			<a
				class="button secondary full"
				href="{resolve('/(app)/register')}?role=VENDOR"
				style="font-size: 12px; font-weight: 600; text-align: center;"
			>
				Daftar sebagai Penyelenggara / Vendor Baru ↗
			</a>
			<button
				type="button"
				class="text-button"
				style="margin-top: 10px; font-size: 11px;"
				onclick={() => (loginType = 'CANDIDATE')}
			>
				← Kembali ke login pelamar kerja
			</button>
		</div>
	{:else}
		<p class="form-footer" style="margin-top: 24px;">
			Belum punya akun pelamar?
			<a href="{resolve('/(app)/register')}?role=CANDIDATE" style="color: var(--green); font-weight: 700;">
				Daftar Akun Pelamar Baru →
			</a>
		</p>

		<!-- Card Khusus Pengunjung yang Merupakan Penyelenggara / Perusahaan -->
		<div style="background: #fbfcf9; border: 1px dashed var(--line); border-radius: 10px; padding: 14px 16px; margin-top: 18px; text-align: left;">
			<span style="font-size: 11px; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.5px;">
				🏢 Mitra Penyelenggara / Perusahaan?
			</span>
			<p style="font-size: 12px; color: var(--muted); margin: 4px 0 10px; line-height: 1.5;">
				Ingin mempublikasikan lowongan alih daya dan mengelola pelamar?
			</p>
			<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
				<button
					type="button"
					class="text-button"
					style="font-size: 11px; font-weight: 600; color: var(--green); padding: 0;"
					onclick={() => (loginType = 'VENDOR')}
				>
					Masuk sebagai Penyelenggara →
				</button>
				<span style="color: var(--line);">•</span>
				<a
					href="{resolve('/(app)/register')}?role=VENDOR"
					style="font-size: 11px; font-weight: 600; color: var(--ink); text-decoration: underline;"
				>
					Daftar Penyelenggara Baru ↗
				</a>
			</div>
		</div>
	{/if}

	<p style="text-align: center; margin-top: 18px; font-size: 11px; color: var(--muted);">
		Staf internal Upstream?
		<a href={resolve('/(app)/admin/login')} style="color: var(--green); font-weight: 600; margin-left: 4px;">
			Masuk di Portal Admin ↗
		</a>
	</p>
</AuthFrame>
