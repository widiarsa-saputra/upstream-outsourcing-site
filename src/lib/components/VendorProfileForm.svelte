<script lang="ts">
	import { untrack } from 'svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import FieldError from './FieldError.svelte';
	import type { Vendor, VendorInput } from '#lib/marketplace/types.ts';
	let { vendor }: { vendor: Vendor } = $props();
	const session = useSession();
	const queries = useQueryClient();
	const initial = untrack(() => vendor);
	let form = $state<VendorInput>({
		version: initial.version,
		name: initial.name,
		description: initial.description,
		industry: initial.industry,
		location: initial.location,
		address: initial.address,
		website: initial.website,
		picName: initial.picName,
		picEmail: initial.picEmail || session.user?.email || '',
		picPhone: initial.picPhone,
		npwp: initial.npwp,
		nib: initial.nib,
		emailNotifications: initial.emailNotifications
	});
	const save = createMutation(() => ({
		mutationFn: () =>
			session.api.request<Vendor>('/vendor/profile', {
				method: 'PATCH',
				body: JSON.stringify(form)
			}),
		onSuccess: async () => {
			await queries.invalidateQueries({ queryKey: ['vendor', session.user?.id] });
		}
	}));
</script>

<section class="panel">
	<div class="section-heading">
		<div>
			<p class="eyebrow">IDENTITAS MITRA</p>
			<h2>Profil perusahaan.</h2>
		</div>
	</div>
	{#if vendor.status === 'approved' || vendor.status === 'pending'}<p class="notice">
			Menyimpan perubahan profil membatalkan clearance saat ini dan menyembunyikan lowongan yang
			tayang. Ajukan clearance kembali setelah selesai.
		</p>{/if}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			if (
				vendor.status === 'approved' &&
				!confirm('Simpan perubahan dan ajukan clearance ulang? Lowongan tayang akan disembunyikan.')
			)
				return;
			save.mutate();
		}}
	>
		<div class="form-grid">
			<div class="span-two">
				<label for="company-name">Nama perusahaan</label><input
					id="company-name"
					bind:value={form.name}
					required
					minlength="2"
					maxlength="150"
				/><FieldError error={save.error} field="name" />
			</div>
			<div>
				<label for="industry">Industri</label><input
					id="industry"
					bind:value={form.industry}
					required
					minlength="2"
					maxlength="100"
					placeholder="Contoh: Logistik"
				/>
			</div>
			<div>
				<label for="location">Kota / lokasi</label><input
					id="location"
					bind:value={form.location}
					required
					minlength="2"
					maxlength="150"
					placeholder="Contoh: Makassar"
				/>
			</div>
			<div class="span-two">
				<label for="description">Tentang perusahaan</label><textarea
					id="description"
					rows="5"
					bind:value={form.description}
					required
					minlength="30"
					maxlength="10000"></textarea><FieldError error={save.error} field="description" />
			</div>
			<div class="span-two">
				<label for="address">Alamat legal perusahaan (privat)</label><textarea
					id="address"
					rows="2"
					bind:value={form.address}
					required
					minlength="8"
					maxlength="500"></textarea>
			</div>
			<div class="span-two">
				<label for="website">Website (opsional)</label><input
					id="website"
					type="url"
					bind:value={form.website}
					placeholder="https://perusahaan.com"
					maxlength="500"
				/><FieldError error={save.error} field="website" />
			</div>
			<div>
				<label for="pic-name">Nama PIC</label><input
					id="pic-name"
					bind:value={form.picName}
					required
					minlength="2"
					maxlength="100"
				/>
			</div>
			<div>
				<label for="pic-email">Email PIC (privat)</label><input
					id="pic-email"
					type="email"
					bind:value={form.picEmail}
					required
					maxlength="254"
				/>
			</div>
			<div>
				<label for="pic-phone">Telepon PIC (privat)</label><input
					id="pic-phone"
					type="tel"
					bind:value={form.picPhone}
					required
					minlength="7"
					maxlength="30"
				/>
			</div>
			<div>
				<label for="npwp">Nomor NPWP (privat)</label><input
					id="npwp"
					bind:value={form.npwp}
					required
					minlength="8"
					maxlength="40"
				/>
			</div>
			<div>
				<label for="nib">Nomor NIB (privat)</label><input
					id="nib"
					bind:value={form.nib}
					required
					minlength="8"
					maxlength="40"
				/>
			</div>
		</div>
		<label class="checkbox-label"
			><input type="checkbox" bind:checked={form.emailNotifications} /> Kirim hasil clearance dan moderasi
			melalui email PIC</label
		>{#if save.isError}<p class="notice error" role="alert">
				{errorMessage(save.error)}
			</p>{/if}<button class="button" disabled={save.isPending}
			>{save.isPending ? 'Menyimpan…' : 'Simpan profil →'}</button
		>
	</form>
</section>
