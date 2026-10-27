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

<svelte:head><title>Buat akun — Upstream</title></svelte:head>
<AuthFrame
	eyebrow="LANGKAH PERTAMA ANDA"
	title="Ruang untuk tumbuh."
	subtitle="Buat akun dan mulai perjalanan bersama kami."
>
	{#if register.isSuccess}<div class="notice" role="status">{register.data.message}</div>
		<a class="button full" href={resolve('/(app)/login')}>Lanjut ke login →</a>
	{:else}<form
			onsubmit={(event) => {
				event.preventDefault();
				register.mutate();
			}}
		>
			<label for="role">Saya ingin bergabung sebagai</label><select id="role" bind:value={role}
				><option value="CANDIDATE">Kandidat pencari kerja</option><option value="VENDOR"
					>Mitra perusahaan</option
				></select
			>
			<label for="name">{role === 'VENDOR' ? 'Nama PIC / perwakilan' : 'Nama lengkap'}</label><input
				id="name"
				bind:value={name}
				required
				minlength="2"
				maxlength="100"
				autocomplete="name"
			/>
			<FieldError error={register.error} field="name" />
			<label for="email">Alamat email</label><input
				id="email"
				type="email"
				bind:value={email}
				required
				autocomplete="email"
			/>
			<FieldError error={register.error} field="email" />
			<label for="password">Password</label><input
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
			<p id="password-help" class="field-help">Gunakan minimal 12 karakter.</p>
			{#if register.isError}<p class="notice error" role="alert">
					{errorMessage(register.error)}
				</p>{/if}
			<button class="button full" disabled={register.isPending}
				>{register.isPending ? 'Membuat akun…' : 'Buat akun'} <span>↗</span></button
			>
		</form>{/if}
	<p class="form-footer">Sudah punya akun? <a href={resolve('/(app)/login')}>Masuk →</a></p>
</AuthFrame>
