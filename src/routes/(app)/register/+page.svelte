<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import FieldError from '#lib/components/FieldError.svelte';
	import AuthFrame from '#lib/components/AuthFrame.svelte';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';

	const session = useSession();
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let role = $state(page.url.searchParams.get('role') === 'VENDOR' ? 'VENDOR' : 'CANDIDATE');

	const register = createMutation(() => ({
		mutationFn: () =>
			session.api.request<{ message: string }>('/auth/register', {
				method: 'POST',
				anonymous: true,
				body: JSON.stringify({ name, email, password, role })
			})
	}));
</script>

<svelte:head>
	<title>{role === 'VENDOR' ? 'Daftar Penyelenggara / Mitra' : 'Daftar Pelamar Kerja'} — Upstream</title>
</svelte:head>

<AuthFrame
	eyebrow={role === 'VENDOR' ? 'KEMITRAAN PENYELENGGARA' : 'LANGKAH PERTAMA ANDA'}
	title={role === 'VENDOR' ? 'Daftar Mitra Penyelenggara.' : 'Ruang untuk tumbuh.'}
	subtitle={role === 'VENDOR'
		? 'Buka lowongan alih daya dan rekrut talenta siap kerja untuk perusahaan Anda.'
		: 'Buat akun gratis dan mulai perjalanan karier Anda bersama kami.'}
>
	{#if register.isSuccess}
		<div class="notice" role="status">
			<strong style="display: block; font-size: 14px; margin-bottom: 4px;">Pendaftaran Berhasil!</strong>
			{register.data.message}
		</div>
		<a class="button full" href="{resolve('/(app)/login')}?portal={role === 'VENDOR' ? 'vendor' : 'candidate'}">
			Lanjut ke Halaman Masuk →
		</a>
	{:else}
		<form
			onsubmit={(event) => {
				event.preventDefault();
				register.mutate();
			}}
		>
			<label for="role">Saya ingin mendaftar sebagai</label>
			<select id="role" bind:value={role}>
				<option value="CANDIDATE">👤 Kandidat pencari kerja (Gratis)</option>
				<option value="VENDOR">🏢 Mitra penyelenggara (Perusahaan)</option>
			</select>

			{#if role === 'VENDOR'}
				<div style="background: #edf0e6; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; font-size: 12px; color: #3d5642; line-height: 1.5;">
					ℹ️ <strong>Mitra Penyelenggara:</strong> Setelah pendaftaran, Anda akan dapat melengkapi profil perusahaan serta dokumen legalitas (NIB & NPWP) untuk clearance lowongan.
				</div>
			{/if}

			<label for="name">{role === 'VENDOR' ? 'Nama PIC / Penanggung Jawab' : 'Nama Lengkap Sesuai KTP'}</label>
			<input
				id="name"
				bind:value={name}
				required
				minlength="2"
				maxlength="100"
				autocomplete="name"
				placeholder={role === 'VENDOR' ? 'Contoh: Budi Santoso (HR Manager)' : 'Contoh: Ahmad Fauzi'}
			/>
			<FieldError error={register.error} field="name" />

			<label for="email">Alamat Email {role === 'VENDOR' ? 'Perusahaan Resmi' : 'Aktif'}</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				required
				autocomplete="email"
				placeholder={role === 'VENDOR' ? 'hr@perusahaan.co.id' : 'nama@gmail.com'}
			/>
			<FieldError error={register.error} field="email" />

			<label for="password">Password</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				required
				minlength="12"
				maxlength="128"
				autocomplete="new-password"
				aria-describedby="password-help"
			/>
			<FieldError error={register.error} field="password" />
			<p id="password-help" class="field-help">Gunakan minimal 12 karakter demi keamanan akun.</p>

			{#if register.isError}
				<p class="notice error" role="alert">
					{errorMessage(register.error)}
				</p>
			{/if}

			<button class="button full" disabled={register.isPending}>
				{register.isPending
					? 'Membuat akun…'
					: role === 'VENDOR'
						? 'Daftar sebagai Penyelenggara'
						: 'Buat Akun Pelamar'} <span>↗</span>
			</button>
		</form>
	{/if}

	<p class="form-footer" style="margin-top: 24px;">
		Sudah memiliki akun?
		<a href="{resolve('/(app)/login')}?portal={role === 'VENDOR' ? 'vendor' : 'candidate'}">
			Masuk ke portal →
		</a>
	</p>
</AuthFrame>
