<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type {
		CandidateProfile,
		CandidateProfileDto,
		ExperienceInput,
		EducationInput,
		SkillInput
	} from '#lib/candidate/types.ts';

	const session = useSession();
	const queryClient = useQueryClient();

	const profileQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'profile'],
		enabled: !!session.user?.id,
		queryFn: ({ signal }) => session.api.request<CandidateProfile>('/candidate/profile', { signal })
	}));

	let profileForm = $state<CandidateProfileDto>({
		version: 1,
		headline: '',
		bio: '',
		phone: '',
		location: '',
		address: '',
		gender: ''
	});

	let initialized = $state(false);
	let saveSuccessMessage = $state('');

	$effect(() => {
		if (profileQuery.data && !initialized) {
			const d = profileQuery.data;
			profileForm = {
				version: d.version,
				headline: d.headline || '',
				bio: d.bio || '',
				phone: d.phone || '',
				location: d.location || '',
				address: d.address || '',
				gender: d.gender || ''
			};
			initialized = true;
		}
	});

	const saveProfileMutation = createMutation(() => ({
		mutationFn: (body: CandidateProfileDto) =>
			session.api.request<CandidateProfile>('/candidate/profile', {
				method: 'PATCH',
				body: JSON.stringify(body)
			}),
		onSuccess: (saved) => {
			queryClient.setQueryData(['candidate', session.user?.id, 'profile'], saved);
			profileForm.version = saved.version;
			saveSuccessMessage = 'Informasi dasar profil berhasil diperbarui!';
			setTimeout(() => {
				saveSuccessMessage = '';
			}, 3500);
		}
	}));

	// Experience mutation
	let showExpModal = $state(false);
	let expForm = $state<ExperienceInput>({
		company: '',
		position: '',
		location: '',
		startDate: '',
		endDate: '',
		isCurrent: false,
		description: ''
	});

	const addExpMutation = createMutation(() => ({
		mutationFn: (body: ExperienceInput) =>
			session.api.request('/candidate/experiences', {
				method: 'POST',
				body: JSON.stringify(body)
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
			showExpModal = false;
		}
	}));

	const deleteExpMutation = createMutation(() => ({
		mutationFn: (id: string) =>
			session.api.request('/candidate/experiences/' + id, { method: 'DELETE' }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
		}
	}));

	function openAddExperience() {
		expForm = {
			company: '',
			position: '',
			location: '',
			startDate: '',
			endDate: '',
			isCurrent: false,
			description: ''
		};
		showExpModal = true;
	}

	// Education mutation
	let showEduModal = $state(false);
	let eduForm = $state<EducationInput>({
		institution: '',
		degree: 'S1',
		fieldOfStudy: '',
		startDate: '',
		endDate: '',
		isCurrent: false,
		grade: '',
		description: ''
	});

	const addEduMutation = createMutation(() => ({
		mutationFn: (body: EducationInput) =>
			session.api.request('/candidate/educations', {
				method: 'POST',
				body: JSON.stringify(body)
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
			showEduModal = false;
		}
	}));

	const deleteEduMutation = createMutation(() => ({
		mutationFn: (id: string) =>
			session.api.request('/candidate/educations/' + id, { method: 'DELETE' }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
		}
	}));

	function openAddEducation() {
		eduForm = {
			institution: '',
			degree: 'S1 / Sarjana',
			fieldOfStudy: '',
			startDate: '',
			endDate: '',
			isCurrent: false,
			grade: '',
			description: ''
		};
		showEduModal = true;
	}

	// Skills mutation
	let newSkillName = $state('');
	let newSkillLevel = $state('intermediate');

	const addSkillMutation = createMutation(() => ({
		mutationFn: (body: SkillInput) =>
			session.api.request('/candidate/skills', {
				method: 'POST',
				body: JSON.stringify(body)
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
			newSkillName = '';
		}
	}));

	const deleteSkillMutation = createMutation(() => ({
		mutationFn: (id: string) =>
			session.api.request('/candidate/skills/' + id, { method: 'DELETE' }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['candidate', session.user?.id, 'profile'] });
		}
	}));

	function addSkill() {
		if (!newSkillName.trim()) return;
		addSkillMutation.mutate({
			name: newSkillName.trim(),
			level: newSkillLevel
		});
	}
</script>

<svelte:head>
	<title>CV & Profil Digital — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">DIGITAL RESUME & PROFIL</p>
		<h1>Profil & <em>CV Digital.</em></h1>
		<p class="lead">
			Informasi di bawah ini akan ditampilkan kepada tim kurasi staf internal dan mitra penyedia kerja alih daya.
		</p>
	</div>
</div>

{#if saveSuccessMessage}
	<div class="notice" role="status" style="background: #eef8ea; border-color: #badba7; color: var(--green);">
		<p><strong>Sukses!</strong> {saveSuccessMessage}</p>
	</div>
{/if}

{#if profileQuery.isPending}
	<div class="notice" role="status">Memuat profil kandidat…</div>
{:else if profileQuery.isError}
	<div class="notice error" role="alert">{errorMessage(profileQuery.error)}</div>
{:else}
	<div style="display: flex; flex-direction: column; gap: 24px;">
		<!-- Section 1: Data Kontak & Headline -->
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<h2>Informasi Kontak & Headline</h2>
			<p class="muted" style="margin-bottom: 20px;">Deskripsikan posisi keahlian dan cara tim merekrut menghubungi Anda.</p>

			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
				<div>
					<label for="headline" style="display: block; font-weight: 600; margin-bottom: 6px;">Headline Profesional</label>
					<input
						id="headline"
						type="text"
						placeholder="Contoh: Senior Frontend Engineer | Svelte & React Specialist"
						bind:value={profileForm.headline}
						style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
					/>
				</div>

				<div>
					<label for="phone" style="display: block; font-weight: 600; margin-bottom: 6px;">Nomor Telepon / WhatsApp</label>
					<input
						id="phone"
						type="text"
						placeholder="Contoh: 081234567890"
						bind:value={profileForm.phone}
						style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
					/>
				</div>

				<div>
					<label for="location" style="display: block; font-weight: 600; margin-bottom: 6px;">Kota / Lokasi Domisili</label>
					<input
						id="location"
						type="text"
						placeholder="Contoh: Denpasar, Bali"
						bind:value={profileForm.location}
						style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
					/>
				</div>

				<div>
					<label for="gender" style="display: block; font-weight: 600; margin-bottom: 6px;">Jenis Kelamin</label>
					<select
						id="gender"
						bind:value={profileForm.gender}
						style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; background: white;"
					>
						<option value="">Pilih Jenis Kelamin</option>
						<option value="MALE">Laki-laki</option>
						<option value="FEMALE">Perempuan</option>
					</select>
				</div>
			</div>

			<div style="margin-top: 16px;">
				<label for="bio" style="display: block; font-weight: 600; margin-bottom: 6px;">Ringkasan Diri (Bio / Summary)</label>
				<textarea
					id="bio"
					rows="4"
					placeholder="Ceritakan latar belakang karier, keunggulan kerja, dan nilai tambah yang Anda bawa untuk perusahaan mitra..."
					bind:value={profileForm.bio}
					style="width: 100%; padding: 12px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit;"
				></textarea>
			</div>

			<div style="display: flex; justify-content: flex-end; margin-top: 16px;">
				<button
					class="button primary small"
					disabled={saveProfileMutation.isPending}
					onclick={() => saveProfileMutation.mutate(profileForm)}
				>
					{saveProfileMutation.isPending ? 'Menyimpan…' : 'Simpan Informasi Dasar ↗'}
				</button>
			</div>
		</section>

		<!-- Section 2: Pengalaman Kerja -->
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
				<div>
					<h2 style="margin: 0;">Pengalaman Kerja</h2>
					<p class="muted" style="margin: 4px 0 0;">Riwayat pekerjaan sebelumnya atau proyek yang pernah diselesaikan.</p>
				</div>
				<button class="button secondary small" onclick={openAddExperience}>+ Tambah Pengalaman</button>
			</div>

			{#if (profileQuery.data.experiences || []).length === 0}
				<p class="muted" style="font-style: italic; padding: 20px 0;">Belum ada pengalaman kerja ditambahkan.</p>
			{:else}
				<div style="display: flex; flex-direction: column; gap: 14px;">
					{#each profileQuery.data.experiences as exp (exp.id)}
						<div style="padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fafbf9;">
							<div style="display: flex; justify-content: space-between; align-items: flex-start;">
								<div>
									<h3 style="margin: 0; font-size: 1.15rem; color: var(--green);">{exp.position}</h3>
									<p style="margin: 2px 0 8px; font-weight: 600; color: var(--ink);">
										{exp.company} {exp.location ? `• ${exp.location}` : ''}
									</p>
									<span class="muted" style="font-size: 13px;">
										{new Date(exp.startDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })} – 
										{exp.isCurrent ? 'Sekarang (Masih Bekerja)' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }) : 'Selesai'}
									</span>
								</div>
								<button
									class="text-button"
									style="color: #b91c1c;"
									disabled={deleteExpMutation.isPending}
									onclick={() => deleteExpMutation.mutate(exp.id)}
								>
									Hapus
								</button>
							</div>
							{#if exp.description}
								<p style="margin: 10px 0 0; font-size: 14px; line-height: 1.5; white-space: pre-line;">{exp.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Section 3: Pendidikan -->
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
				<div>
					<h2 style="margin: 0;">Riwayat Pendidikan</h2>
					<p class="muted" style="margin: 4px 0 0;">Pendidikan formal terakhir Anda (SMK, D3, S1, dsb).</p>
				</div>
				<button class="button secondary small" onclick={openAddEducation}>+ Tambah Pendidikan</button>
			</div>

			{#if (profileQuery.data.educations || []).length === 0}
				<p class="muted" style="font-style: italic; padding: 20px 0;">Belum ada riwayat pendidikan ditambahkan.</p>
			{:else}
				<div style="display: flex; flex-direction: column; gap: 14px;">
					{#each profileQuery.data.educations as edu (edu.id)}
						<div style="padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fafbf9;">
							<div style="display: flex; justify-content: space-between; align-items: flex-start;">
								<div>
									<h3 style="margin: 0; font-size: 1.15rem; color: var(--green);">{edu.institution}</h3>
									<p style="margin: 2px 0 8px; font-weight: 600; color: var(--ink);">
										{edu.degree} — {edu.fieldOfStudy}
									</p>
									<span class="muted" style="font-size: 13px;">
										Tahun {new Date(edu.startDate).getFullYear()} – {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Sekarang'} {edu.grade ? `(IPK/Nilai: ${edu.grade})` : ''}
									</span>
								</div>
								<button
									class="text-button"
									style="color: #b91c1c;"
									disabled={deleteEduMutation.isPending}
									onclick={() => deleteEduMutation.mutate(edu.id)}
								>
									Hapus
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Section 4: Keahlian (Skills) -->
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
			<h2>Keahlian & Kompetensi</h2>
			<p class="muted" style="margin-bottom: 16px;">Tambahkan keahlian teknis atau spesialisasi pekerjaan yang relevan.</p>

			<div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
				<input
					type="text"
					placeholder="Nama keahlian (contoh: TypeScript, Akuntansi, K3)"
					bind:value={newSkillName}
					onkeydown={(e) => e.key === 'Enter' && addSkill()}
					style="flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
				/>
				<select
					bind:value={newSkillLevel}
					style="padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; background: white;"
				>
					<option value="beginner">Pemula (Beginner)</option>
					<option value="intermediate">Menengah (Intermediate)</option>
					<option value="advanced">Lanjutan (Advanced)</option>
					<option value="expert">Ahli (Expert)</option>
				</select>
				<button class="button secondary" disabled={addSkillMutation.isPending} onclick={addSkill}>
					{addSkillMutation.isPending ? 'Menambah…' : '+ Tambah Skill'}
				</button>
			</div>

			<div style="display: flex; flex-wrap: wrap; gap: 8px;">
				{#if (profileQuery.data.skills || []).length === 0}
					<span class="muted" style="font-style: italic;">Belum ada tag keahlian ditambahkan.</span>
				{:else}
					{#each profileQuery.data.skills as skill (skill.id)}
						<span
							style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #eef2eb; border: 1px solid #d4decb; border-radius: 999px; font-size: 13px;"
						>
							<strong>{skill.name}</strong>
							<small style="color: var(--muted);">({skill.level})</small>
							<button
								aria-label="Hapus skill"
								disabled={deleteSkillMutation.isPending}
								onclick={() => deleteSkillMutation.mutate(skill.id)}
								style="background: none; border: none; padding: 0 2px; cursor: pointer; color: #888; font-weight: bold;"
							>
								×
							</button>
						</span>
					{/each}
				{/if}
			</div>
		</section>
	</div>
{/if}

<!-- Modal Dialog: Tambah Pengalaman Kerja -->
{#if showExpModal}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 100; padding: 16px;"
	>
		<div style="background: white; border-radius: 12px; width: 100%; max-width: 540px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
			<h3 style="margin-top: 0; margin-bottom: 16px; color: var(--green);">Tambah Pengalaman Kerja</h3>
			<div style="display: flex; flex-direction: column; gap: 14px;">
				<div>
					<label for="exp-pos" style="display: block; font-weight: 600; margin-bottom: 4px;">Posisi / Jabatan *</label>
					<input
						id="exp-pos"
						type="text"
						placeholder="Contoh: Staff Administrasi / Staf Gudang"
						bind:value={expForm.position}
						style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
					/>
				</div>
				<div>
					<label for="exp-comp" style="display: block; font-weight: 600; margin-bottom: 4px;">Nama Perusahaan / Organisasi *</label>
					<input
						id="exp-comp"
						type="text"
						placeholder="Contoh: PT Sumber Berkah Bersama"
						bind:value={expForm.company}
						style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
					/>
				</div>
				<div>
					<label for="exp-loc" style="display: block; font-weight: 600; margin-bottom: 4px;">Lokasi</label>
					<input
						id="exp-loc"
						type="text"
						placeholder="Contoh: Badung, Bali"
						bind:value={expForm.location}
						style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
					/>
				</div>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
					<div>
						<label for="exp-start" style="display: block; font-weight: 600; margin-bottom: 4px;">Mulai Kerja *</label>
						<input
							id="exp-start"
							type="date"
							bind:value={expForm.startDate}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
					<div>
						<label for="exp-end" style="display: block; font-weight: 600; margin-bottom: 4px;">Selesai Kerja</label>
						<input
							id="exp-end"
							type="date"
							disabled={expForm.isCurrent}
							bind:value={expForm.endDate}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
				</div>
				<label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
					<input type="checkbox" bind:checked={expForm.isCurrent} />
					<span>Saya masih bekerja di posisi ini saat ini</span>
				</label>
				<div>
					<label for="exp-desc" style="display: block; font-weight: 600; margin-bottom: 4px;">Tanggung Jawab & Pencapaian</label>
					<textarea
						id="exp-desc"
						rows="3"
						placeholder="Jelaskan peran kerja harian atau proyek utama yang Anda selesaikan..."
						bind:value={expForm.description}
						style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-family: inherit;"
					></textarea>
				</div>
			</div>
			<div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
				<button class="button secondary" onclick={() => (showExpModal = false)}>Batal</button>
				<button
					class="button primary"
					disabled={addExpMutation.isPending || !expForm.company || !expForm.position || !expForm.startDate}
					onclick={() => addExpMutation.mutate(expForm)}
				>
					{addExpMutation.isPending ? 'Menyimpan…' : 'Tambahkan ke CV'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Dialog: Tambah Pendidikan -->
{#if showEduModal}
	<div
		style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 100; padding: 16px;"
	>
		<div style="background: white; border-radius: 12px; width: 100%; max-width: 500px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
			<h3 style="margin-top: 0; margin-bottom: 16px; color: var(--green);">Tambah Riwayat Pendidikan</h3>
			<div style="display: flex; flex-direction: column; gap: 14px;">
				<div>
					<label for="edu-inst" style="display: block; font-weight: 600; margin-bottom: 4px;">Nama Institusi / Kampus / Sekolah *</label>
					<input
						id="edu-inst"
						type="text"
						placeholder="Contoh: Universitas Udayana / SMK N 1"
						bind:value={eduForm.institution}
						style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
					/>
				</div>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
					<div>
						<label for="edu-deg" style="display: block; font-weight: 600; margin-bottom: 4px;">Jenjang *</label>
						<input
							id="edu-deg"
							type="text"
							placeholder="SMK / D3 / S1 / S2"
							bind:value={eduForm.degree}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
					<div>
						<label for="edu-field" style="display: block; font-weight: 600; margin-bottom: 4px;">Jurusan / Bidang Studi *</label>
						<input
							id="edu-field"
							type="text"
							placeholder="Contoh: Teknik Informatika"
							bind:value={eduForm.fieldOfStudy}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
				</div>
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
					<div>
						<label for="edu-start" style="display: block; font-weight: 600; margin-bottom: 4px;">Tanggal Mulai *</label>
						<input
							id="edu-start"
							type="date"
							bind:value={eduForm.startDate}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
					<div>
						<label for="edu-end" style="display: block; font-weight: 600; margin-bottom: 4px;">Tanggal Lulus</label>
						<input
							id="edu-end"
							type="date"
							bind:value={eduForm.endDate}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
					<div>
						<label for="edu-grade" style="display: block; font-weight: 600; margin-bottom: 4px;">IPK / Nilai</label>
						<input
							id="edu-grade"
							type="text"
							placeholder="3.75"
							bind:value={eduForm.grade}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
				</div>
			</div>
			<div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
				<button class="button secondary" onclick={() => (showEduModal = false)}>Batal</button>
				<button
					class="button primary"
					disabled={addEduMutation.isPending || !eduForm.institution || !eduForm.degree || !eduForm.fieldOfStudy || !eduForm.startDate}
					onclick={() => addEduMutation.mutate(eduForm)}
				>
					{addEduMutation.isPending ? 'Menyimpan…' : 'Tambahkan ke CV'}
				</button>
			</div>
		</div>
	</div>
{/if}
