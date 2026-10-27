<script lang="ts">
	import { untrack } from 'svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import FieldError from './FieldError.svelte';
	import { witaDateInput, type Job, type JobInput } from '#lib/marketplace/types.ts';
	let { job }: { job?: Job } = $props();
	const session = useSession();
	const queries = useQueryClient();
	const initial = untrack(() => job);
	let form = $state<JobInput>({
		title: initial?.title || '',
		description: initial?.description || '',
		qualifications: initial?.qualifications || '',
		benefits: initial?.benefits || '',
		industry: initial?.industry || '',
		location: initial?.location || '',
		workMode: initial?.workMode || 'ONSITE',
		employmentType: initial?.employmentType || 'CONTRACT',
		salaryMin: initial?.salaryMin || 0,
		salaryMax: initial?.salaryMax || 0,
		salaryVisible: initial?.salaryVisible ?? true,
		salaryPeriod: initial?.salaryPeriod || 'MONTH',
		openings: initial?.openings || 1,
		deadline: initial?.deadline || null,
		requirements: initial?.requirements.map((r) => ({ ...r })) || [
			{ code: 'CV', name: 'CV / Resume', required: true }
		]
	});
	let deadline = $state(initial?.deadline ? witaDateInput(initial.deadline) : '');
	const save = createMutation(() => ({
		mutationFn: () =>
			session.api.request<Job>(job ? '/vendor/jobs/' + job.id : '/vendor/jobs', {
				method: job ? 'PATCH' : 'POST',
				body: JSON.stringify({
					...form,
					deadline: deadline ? deadline + 'T15:59:59.000Z' : null,
					...(job ? { version: job.version } : {})
				})
			}),
		onSuccess: async (result) => {
			await queries.invalidateQueries({ queryKey: ['vendor', session.user?.id] });
			await goto(resolve('/(app)/(protected)/vendor/jobs/[id]', { id: result.id }));
		}
	}));
</script>

<section class="panel">
	{#if job}<p class="notice">
			Menyimpan perubahan mengembalikan lowongan ke draft dan menghentikan penayangannya. Ajukan
			moderasi ulang setelah selesai.
		</p>{/if}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			if (
				job?.publicationStatus === 'published' &&
				!confirm('Simpan perubahan dan hentikan penayangan sampai moderasi ulang?')
			)
				return;
			save.mutate();
		}}
	>
		<div class="form-grid">
			<div class="span-two">
				<label for="job-title">Nama posisi</label><input
					id="job-title"
					bind:value={form.title}
					required
					minlength="3"
					maxlength="150"
					placeholder="Contoh: Operator Gudang"
				/><FieldError error={save.error} field="title" />
			</div>
			<div>
				<label for="job-industry">Industri</label><input
					id="job-industry"
					bind:value={form.industry}
					required
					minlength="2"
					maxlength="100"
				/>
			</div>
			<div>
				<label for="job-location">Lokasi kerja</label><input
					id="job-location"
					bind:value={form.location}
					required
					minlength="2"
					maxlength="150"
				/>
			</div>
			<div>
				<label for="job-mode">Pola kerja</label><select id="job-mode" bind:value={form.workMode}
					><option value="ONSITE">On-site</option><option value="REMOTE">Remote</option><option
						value="HYBRID">Hybrid</option
					></select
				>
			</div>
			<div>
				<label for="job-employment">Hubungan kerja</label><select
					id="job-employment"
					bind:value={form.employmentType}
					><option value="CONTRACT">Kontrak</option><option value="FULL_TIME">Full time</option
					><option value="PART_TIME">Paruh waktu</option><option value="INTERNSHIP">Magang</option
					></select
				>
			</div>
			<div class="span-two">
				<label for="job-description">Deskripsi pekerjaan</label><textarea
					id="job-description"
					rows="6"
					bind:value={form.description}
					required
					minlength="30"
					maxlength="20000"></textarea><FieldError error={save.error} field="description" />
			</div>
			<div class="span-two">
				<label for="job-qualifications">Kualifikasi</label><textarea
					id="job-qualifications"
					rows="5"
					bind:value={form.qualifications}
					required
					minlength="15"
					maxlength="10000"></textarea>
			</div>
			<div class="span-two">
				<label for="job-benefits">Benefit (opsional)</label><textarea
					id="job-benefits"
					rows="3"
					bind:value={form.benefits}
					maxlength="10000"></textarea>
			</div>
			<div>
				<label for="salary-min">Gaji minimum (IDR)</label><input
					id="salary-min"
					type="number"
					bind:value={form.salaryMin}
					required
					min="0"
					max="1000000000"
					step="1"
				/>
			</div>
			<div>
				<label for="salary-max">Gaji maksimum (IDR)</label><input
					id="salary-max"
					type="number"
					bind:value={form.salaryMax}
					required
					min={form.salaryMin}
					max="1000000000"
					step="1"
				/>
			</div>
			<div>
				<label for="salary-period">Periode gaji</label><select
					id="salary-period"
					bind:value={form.salaryPeriod}
					><option value="MONTH">Per bulan</option><option value="DAY">Per hari</option></select
				>
			</div>
			<div>
				<label for="openings">Jumlah kebutuhan</label><input
					id="openings"
					type="number"
					bind:value={form.openings}
					required
					min="1"
					max="10000"
					step="1"
				/>
			</div>
			<div>
				<label for="deadline">Batas lamaran (WITA, opsional)</label><input
					id="deadline"
					type="date"
					bind:value={deadline}
					min={witaDateInput()}
				/>
			</div>
		</div>
		<label class="checkbox-label"
			><input type="checkbox" bind:checked={form.salaryVisible} /> Tampilkan rentang gaji di portal publik</label
		>
		<fieldset class="requirement-editor">
			<legend>Persyaratan dokumen per lowongan</legend>
			<p class="muted">
				Kode dokumen unik menggunakan huruf kapital, angka, atau underscore. Beri tanda wajib sesuai
				kebutuhan.
			</p>
			{#each form.requirements as requirement, i (i)}<div class="requirement-row">
					<div>
						<label for={'requirement-code-' + i}>Kode</label><input
							id={'requirement-code-' + i}
							bind:value={requirement.code}
							required
							pattern={'[A-Z][A-Z0-9_]{1,39}'}
							maxlength="40"
							placeholder="SIM_A"
						/>
					</div>
					<div>
						<label for={'requirement-name-' + i}>Nama berkas</label><input
							id={'requirement-name-' + i}
							bind:value={requirement.name}
							required
							minlength="2"
							maxlength="100"
							placeholder="Surat Izin Mengemudi A"
						/>
					</div>
					<label class="checkbox-label"
						><input type="checkbox" bind:checked={requirement.required} /> Wajib</label
					><button
						class="text-button danger-text"
						type="button"
						onclick={() => form.requirements.splice(i, 1)}>Hapus</button
					>
				</div>{/each}<button
				type="button"
				class="button secondary"
				disabled={form.requirements.length >= 20}
				onclick={() =>
					form.requirements.push({
						code: 'DOC_' + (form.requirements.length + 1),
						name: '',
						required: true
					})}>+ Tambah persyaratan</button
			><FieldError error={save.error} field="requirements" />
		</fieldset>
		{#if save.isError}<p class="notice error" role="alert">
				{errorMessage(save.error)}
			</p>{/if}<button class="button" disabled={save.isPending}
			>{save.isPending ? 'Menyimpan…' : 'Simpan sebagai draft →'}</button
		>
	</form>
</section>
