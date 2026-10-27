<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { Vendor } from '#lib/marketplace/types.ts';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import VendorProfileForm from '#lib/components/VendorProfileForm.svelte';
	import LegalDocuments from '#lib/components/LegalDocuments.svelte';
	import ReviewHistory from '#lib/components/ReviewHistory.svelte';
	const session = useSession();
	const queries = useQueryClient();
	const profile = createQuery(() => ({
		queryKey: ['vendor', session.user?.id, 'profile'],
		enabled: session.user?.role === 'VENDOR',
		queryFn: ({ signal }) => session.api.request<Vendor>('/vendor/profile', { signal })
	}));
	const submit = createMutation(() => ({
		mutationFn: () =>
			session.api.request<Vendor>('/vendor/submit-verification', {
				method: 'POST',
				body: JSON.stringify({ version: profile.data?.version })
			}),
		onSuccess: () => queries.invalidateQueries({ queryKey: ['vendor', session.user?.id] })
	}));
	const resend = createMutation(() => ({
		mutationFn: () =>
			session.api.request<{ message: string }>('/auth/resend-verification', {
				method: 'POST',
				anonymous: true,
				body: JSON.stringify({ email: session.user?.email })
			})
	}));
</script>

<svelte:head><title>Profil & clearance vendor — Upstream</title></svelte:head>
<div class="page-heading">
	<div>
		<p class="eyebrow">KONEKSI YANG DIMULAI DENGAN KEPERCAYAAN</p>
		<h1>Kenalkan perusahaan Anda<span class="accent">.</span></h1>
		<p class="muted">Lengkapi profil dan legalitas, lalu ajukan clearance kepada tim internal.</p>
	</div>
</div>
{#if profile.isPending}<p class="notice" role="status">
		Memuat profil perusahaan…
	</p>{:else if profile.isError}<p class="notice error" role="alert">
		{errorMessage(profile.error)}
		<button class="text-button" onclick={() => profile.refetch()}>Coba kembali</button>
	</p>{:else if profile.data}{@const vendor = profile.data}
	<div class="clearance-banner">
		<div>
			<span class="eyebrow">STATUS CLEARANCE</span><StatusBadge
				status={vendor.status}
			/>{#if vendor.reviewReason}<p>{vendor.reviewReason}</p>{/if}
		</div>
		{#if ['draft', 'revision_required', 'rejected'].includes(vendor.status)}<button
				class="button"
				disabled={submit.isPending || !session.user?.emailVerified}
				onclick={() => submit.mutate()}
				>{submit.isPending ? 'Mengajukan…' : 'Ajukan clearance ↗'}</button
			>{/if}
	</div>
	{#if !session.user?.emailVerified}<div class="notice">
			<p>Verifikasi email akun sebelum mengajukan clearance.</p>
			<button class="text-button" disabled={resend.isPending} onclick={() => resend.mutate()}
				>Kirim ulang verifikasi →</button
			>{#if resend.isSuccess}<p role="status">{resend.data.message}</p>{/if}{#if resend.isError}<p
					role="alert"
				>
					{errorMessage(resend.error)}
				</p>{/if}
		</div>{/if}{#if submit.isError}<p class="notice error" role="alert">
			{errorMessage(submit.error)}
		</p>{/if}
	{#key vendor.version}<VendorProfileForm {vendor} />{/key}<LegalDocuments {vendor} />
	<section class="panel"><ReviewHistory reviews={vendor.reviews} /></section>{/if}
