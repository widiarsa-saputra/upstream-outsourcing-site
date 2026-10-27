<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { getLocalCandidateProfile, saveLocalCandidateProfile } from '#lib/candidate/storage.ts';
	import type { CandidateProfile, WorkExperience, Education, SkillItem } from '#lib/candidate/types.ts';

	const session = useSession();
	const queryClient = useQueryClient();

	const profileQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'profile'],
		enabled: !!session.user?.id,
		queryFn: async () => {
			return getLocalCandidateProfile(session.user!.id);
		}
	}));

	let profile = $state<CandidateProfile>({
		userId: '',
		headline: '',
		phone: '',
		location: '',
		bio: '',
		linkedinUrl: '',
		portfolioUrl: '',
		experiences: [],
		educations: [],
		skills: [],
		updatedAt: new Date().toISOString()
	});

	let initialized = $state(false);
	let saveSuccessMessage = $state('');

	$effect(() => {
		if (profileQuery.data && !initialized) {
			profile = JSON.parse(JSON.stringify(profileQuery.data));
			initialized = true;
		}
	});

	const saveMutation = createMutation(() => ({
		mutationFn: async (updated: CandidateProfile) => {
			updated.updatedAt = new Date().toISOString();
			saveLocalCandidateProfile(session.user!.id, updated);
			return updated;
		},
		onSuccess: (saved) => {
			queryClient.setQueryData(['candidate', session.user?.id, 'profile'], saved);
			saveSuccessMessage = 'Perubahan profil dan CV digital berhasil disimpan!';
			setTimeout(() => {
				saveSuccessMessage = '';
			}, 3500);
		}
	}));

	// State for adding new experience
	let showExpModal = $state(false);
	let expForm = $state<WorkExperience>({
		id: '',
		company: '',
		position: '',
		location: '',
		startDate: '',
		endDate: '',
		isCurrent: false,
		description: ''
	});

	function openAddExperience() {
		expForm = {
			id: crypto.randomUUID(),
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

	function saveExperience() {
		if (!expForm.company.trim() || !expForm.position.trim()) return;
		profile.experiences.unshift({ ...expForm });
		showExpModal = false;
	}

	function deleteExperience(id: string) {
		profile.experiences = profile.experiences.filter((e) => e.id !== id);
	}

	// State for adding new education
	let showEduModal = $state(false);
	let eduForm = $state<Education>({
		id: '',
		institution: '',
		degree: 'S1',
		fieldOfStudy: '',
		startDate: '',
		endDate: '',
		grade: ''
	});

	function openAddEducation() {
		eduForm = {
			id: crypto.randomUUID(),
			institution: '',
			degree: 'S1 / Sarjana',
			fieldOfStudy: '',
			startDate: '',
			endDate: '',
			grade: ''
		};
		showEduModal = true;
	}

	function saveEducation() {
		if (!eduForm.institution.trim() || !eduForm.fieldOfStudy.trim()) return;
		profile.educations.unshift({ ...eduForm });
		showEduModal = false;
	}

	function deleteEducation(id: string) {
		profile.educations = profile.educations.filter((e) => e.id !== id);
	}

	// State for adding skill
	let newSkillName = $state('');
	let newSkillLevel = $state<SkillItem['level']>('INTERMEDIATE');

	function addSkill() {
		if (!newSkillName.trim()) return;
		if (profile.skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
			return;
		}
		profile.skills.push({
			id: crypto.randomUUID(),
			name: newSkillName.trim(),
			level: newSkillLevel
		});
		newSkillName = '';
	}

	function removeSkill(id: string) {
		profile.skills = profile.skills.filter((s) => s.id !== id);
	}

	function handleSaveAll() {
		saveMutation.mutate(profile);
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

<div style="display: flex; flex-direction: column; gap: 24px;">
	<!-- Section 1: Data Dasar -->
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
					bind:value={profile.headline}
					style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
				/>
			</div>

			<div>
				<label for="phone" style="display: block; font-weight: 600; margin-bottom: 6px;">Nomor Telepon / WhatsApp</label>
				<input
					id="phone"
					type="text"
					placeholder="Contoh: 081234567890"
					bind:value={profile.phone}
					style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
				/>
			</div>

			<div>
				<label for="location" style="display: block; font-weight: 600; margin-bottom: 6px;">Kota / Lokasi Domisili</label>
				<input
					id="location"
					type="text"
					placeholder="Contoh: Denpasar, Bali"
					bind:value={profile.location}
					style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
				/>
			</div>

			<div>
				<label for="linkedin" style="display: block; font-weight: 600; margin-bottom: 6px;">Profil LinkedIn (Opsional)</label>
				<input
					id="linkedin"
					type="url"
					placeholder="https://linkedin.com/in/username"
					bind:value={profile.linkedinUrl}
					style="width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;"
				/>
			</div>
		</div>

		<div style="margin-top: 16px;">
			<label for="bio" style="display: block; font-weight: 600; margin-bottom: 6px;">Ringkasan Diri (Bio / Summary)</label>
			<textarea
				id="bio"
				rows="4"
				placeholder="Ceritakan latar belakang karier, keunggulan kerja, dan nilai tambah yang Anda bawa untuk perusahaan mitra..."
				bind:value={profile.bio}
				style="width: 100%; padding: 12px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit;"
			></textarea>
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

		{#if profile.experiences.length === 0}
			<p class="muted" style="font-style: italic; padding: 20px 0;">Belum ada pengalaman kerja ditambahkan. Klik tombol di atas untuk menambah.</p>
		{:else}
			<div style="display: flex; flex-direction: column; gap: 14px;">
				{#each profile.experiences as exp (exp.id)}
					<div style="padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fafbf9;">
						<div style="display: flex; justify-content: space-between; align-items: flex-start;">
							<div>
								<h3 style="margin: 0; font-size: 1.15rem; color: var(--green);">{exp.position}</h3>
								<p style="margin: 2px 0 8px; font-weight: 600; color: var(--ink);">
									{exp.company} {exp.location ? `• ${exp.location}` : ''}
								</p>
								<span class="muted" style="font-size: 13px;">
									{exp.startDate} – {exp.isCurrent ? 'Sekarang (Masih Bekerja)' : exp.endDate || 'Selesai'}
								</span>
							</div>
							<button class="text-button" style="color: #b91c1c;" onclick={() => deleteExperience(exp.id)}>
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

		{#if profile.educations.length === 0}
			<p class="muted" style="font-style: italic; padding: 20px 0;">Belum ada riwayat pendidikan ditambahkan.</p>
		{:else}
			<div style="display: flex; flex-direction: column; gap: 14px;">
				{#each profile.educations as edu (edu.id)}
					<div style="padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fafbf9;">
						<div style="display: flex; justify-content: space-between; align-items: flex-start;">
							<div>
								<h3 style="margin: 0; font-size: 1.15rem; color: var(--green);">{edu.institution}</h3>
								<p style="margin: 2px 0 8px; font-weight: 600; color: var(--ink);">
									{edu.degree} — {edu.fieldOfStudy}
								</p>
								<span class="muted" style="font-size: 13px;">
									Tahun {edu.startDate} – {edu.endDate || 'Sekarang'} {edu.grade ? `(IPK/Nilai: ${edu.grade})` : ''}
								</span>
							</div>
							<button class="text-button" style="color: #b91c1c;" onclick={() => deleteEducation(edu.id)}>
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
				<option value="BEGINNER">Pemula (Beginner)</option>
				<option value="INTERMEDIATE">Menengah (Intermediate)</option>
				<option value="ADVANCED">Lanjutan (Advanced)</option>
				<option value="EXPERT">Ahli (Expert)</option>
			</select>
			<button class="button secondary" onclick={addSkill}>+ Tambah Skill</button>
		</div>

		<div style="display: flex; flex-wrap: wrap; gap: 8px;">
			{#if profile.skills.length === 0}
				<span class="muted" style="font-style: italic;">Belum ada tag keahlian ditambahkan.</span>
			{:else}
				{#each profile.skills as skill (skill.id)}
					<span
						style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #eef2eb; border: 1px solid #d4decb; border-radius: 999px; font-size: 13px;"
					>
						<strong>{skill.name}</strong>
						<small style="color: var(--muted);">({skill.level.toLowerCase()})</small>
						<button
							aria-label="Hapus skill"
							onclick={() => removeSkill(skill.id)}
							style="background: none; border: none; padding: 0 2px; cursor: pointer; color: #888; font-weight: bold;"
						>
							×
						</button>
					</span>
				{/each}
			{/if}
		</div>
	</section>

	<!-- Action Footer -->
	<div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
		<button
			class="button primary"
			disabled={saveMutation.isPending}
			onclick={handleSaveAll}
			style="padding: 14px 28px; font-size: 1rem;"
		>
			{saveMutation.isPending ? 'Menyimpan Profil…' : 'Simpan Semua Perubahan Profil ↗'}
		</button>
	</div>
</div>

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
						<label for="exp-start" style="display: block; font-weight: 600; margin-bottom: 4px;">Mulai Kerja</label>
						<input
							id="exp-start"
							type="text"
							placeholder="Bulan Tahun (e.g. Jan 2023)"
							bind:value={expForm.startDate}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
					<div>
						<label for="exp-end" style="display: block; font-weight: 600; margin-bottom: 4px;">Selesai Kerja</label>
						<input
							id="exp-end"
							type="text"
							placeholder="e.g. Des 2024"
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
				<button class="button primary" onclick={saveExperience}>Tambahkan ke CV</button>
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
						<label for="edu-start" style="display: block; font-weight: 600; margin-bottom: 4px;">Tahun Mulai</label>
						<input
							id="edu-start"
							type="text"
							placeholder="2019"
							bind:value={eduForm.startDate}
							style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px;"
						/>
					</div>
					<div>
						<label for="edu-end" style="display: block; font-weight: 600; margin-bottom: 4px;">Tahun Lulus</label>
						<input
							id="edu-end"
							type="text"
							placeholder="2023"
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
				<button class="button primary" onclick={saveEducation}>Tambahkan ke CV</button>
			</div>
		</div>
	</div>
{/if}
