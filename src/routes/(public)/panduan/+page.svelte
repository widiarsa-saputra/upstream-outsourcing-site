<script lang="ts">
	import { resolve } from '$app/paths';
	import { useSession } from '#lib/auth/session.svelte.ts';

	const session = useSession();
	let activeTab = $state<'candidate' | 'vendor' | 'compliance'>('candidate');
</script>

<svelte:head>
	<title>Panduan Pengguna & Kemitraan — Upstream</title>
	<meta
		name="description"
		content="Panduan lengkap bagi pelamar kerja, mitra penyelenggara alih daya, dan kepatuhan regulasi ketenagakerjaan di Upstream."
	/>
</svelte:head>

<section class="public-hero compact" style="margin-bottom: 24px;">
	<div>
		<p class="eyebrow">PUSAT PANDUAN & EDUKASI UPSTREAM</p>
		<h1>Langkah terarah,<br /><em>hasil yang berarti.</em></h1>
		<p>Pelajari panduan praktis untuk pelamar kerja dan mitra penyelenggara alih daya.</p>
	</div>
</section>

<!-- Tab Navigasi Panduan -->
<div style="display: flex; gap: 10px; margin-bottom: 32px; border-bottom: 1px solid var(--line); padding-bottom: 14px; flex-wrap: wrap;">
	<button
		type="button"
		class="button {activeTab === 'candidate' ? 'primary' : 'secondary'}"
		style="font-size: 13px; padding: 10px 18px; border-radius: 8px;"
		onclick={() => (activeTab = 'candidate')}
	>
		👤 Panduan Pelamar Kerja
	</button>
	<button
		type="button"
		class="button {activeTab === 'vendor' ? 'primary' : 'secondary'}"
		style="font-size: 13px; padding: 10px 18px; border-radius: 8px;"
		onclick={() => (activeTab = 'vendor')}
	>
		🏢 Panduan Penyelenggara (Mitra)
	</button>
	<button
		type="button"
		class="button {activeTab === 'compliance' ? 'primary' : 'secondary'}"
		style="font-size: 13px; padding: 10px 18px; border-radius: 8px;"
		onclick={() => (activeTab = 'compliance')}
	>
		⚖️ Standar Kepatuhan & Regulasi
	</button>
</div>

{#if activeTab === 'candidate'}
	<!-- Panduan Pelamar -->
	<section style="display: flex; flex-direction: column; gap: 28px;">
		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
				<span style="background: var(--accent); color: var(--green); width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">1</span>
				<h3 style="margin: 0; font-size: 20px; color: var(--green);">Registrasi Akun & Pengisian Digital CV</h3>
			</div>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 16px;">
				Mulai perjalanan karier Anda dengan membuat akun gratis. Setelah masuk ke Portal Pelamar, lengkapi profil digital Anda yang mencakup:
			</p>
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
				<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 8px; padding: 16px;">
					<strong style="color: var(--ink); font-size: 14px;">Identitas & Kontak</strong>
					<p style="color: var(--muted); font-size: 13px; margin: 6px 0 0;">Nomor telepon aktif, domisili terkini, tanggal lahir, dan ringkasan profesional singkat.</p>
				</div>
				<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 8px; padding: 16px;">
					<strong style="color: var(--ink); font-size: 14px;">Riwayat Pengalaman Kerja</strong>
					<p style="color: var(--muted); font-size: 13px; margin: 6px 0 0;">Pengalaman relevan, nama perusahaan terdahulu, durasi kerja, dan tanggung jawab utama.</p>
				</div>
				<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 8px; padding: 16px;">
					<strong style="color: var(--ink); font-size: 14px;">Pendidikan & Keahlian</strong>
					<p style="color: var(--muted); font-size: 13px; margin: 6px 0 0;">Jenjang pendidikan terakhir, jurusan, serta daftar kompetensi teknis maupun non-teknis.</p>
				</div>
			</div>
		</div>

		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
				<span style="background: var(--accent); color: var(--green); width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">2</span>
				<h3 style="margin: 0; font-size: 20px; color: var(--green);">Unggah Berkas ke Document Vault</h3>
			</div>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 14px;">
				Document Vault adalah brankas dokumen digital Anda. Setiap kali melamar ke lowongan kerja, dokumen aktif Anda akan otomatis dilampirkan tanpa perlu mengunggah ulang berulang kali.
			</p>
			<ul style="color: var(--ink); font-size: 14px; line-height: 1.8; margin-bottom: 16px; padding-left: 20px;">
				<li><strong>Curriculum Vitae (CV / Resume):</strong> Wajib dalam format PDF (maks. 10 MB). Pastikan riwayat jelas dan kontak dapat dihubungi.</li>
				<li><strong>KTP / Kartu Identitas:</strong> Diperlukan untuk verifikasi keabsahan data saat verifikasi legalitas dan pembuatan kontrak kerja alih daya.</li>
				<li><strong>Sertifikat & Portofolio (Opsional):</strong> Dokumen pendukung kompetensi yang meningkatkan skor kurasi Anda.</li>
			</ul>
			<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; font-size: 13px; color: #166534;">
				💡 <strong>Catatan Keamanan:</strong> Berkas Anda disimpan dengan enkripsi dan hanya dapat diakses oleh tim verifikasi Upstream serta mitra penyelenggara lowongan yang Anda lamar.
			</div>
		</div>

		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
				<span style="background: var(--accent); color: var(--green); width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">3</span>
				<h3 style="margin: 0; font-size: 20px; color: var(--green);">Mencari Lowongan & Mengirimkan Lamaran</h3>
			</div>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 14px;">
				Buka menu <strong>Lowongan</strong> atau lihat daftar lowongan di <strong>Beranda</strong>. Anda dapat menyaring berdasarkan lokasi kota, industri, pola kerja (On-site, Remote, Hybrid), dan rentang kompensasi.
			</p>
			<p style="color: var(--muted); line-height: 1.6;">
				Pastikan Anda telah masuk ke akun Anda. Klik tombol <strong>Lamar Posisi Ini</strong>, tambahkan surat pengantar jika diperlukan, lalu konfirmasi pengiriman berkas.
			</p>
		</div>

		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
				<span style="background: var(--accent); color: var(--green); width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">4</span>
				<h3 style="margin: 0; font-size: 20px; color: var(--green);">Memantau Status Lamaran di ATS Tracker</h3>
			</div>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 14px;">
				Di menu <strong>Status Lamaran</strong> pada Portal Pelamar, Anda dapat memantau setiap progres seleksi secara transparan:
			</p>
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Lamaran Terkirim</span>
				<span style="background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Kurasi Staf Internal</span>
				<span style="background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Ditinjau Mitra</span>
				<span style="background: #fce7f3; color: #9d174d; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Wawancara</span>
				<span style="background: #dcfce7; color: #15803d; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Offering & Onboarding</span>
			</div>
		</div>

		<div style="text-align: center; padding: 24px 0;">
			<a class="button" href={resolve('/(public)/jobs')}>Mulai Eksplorasi Lowongan Kerja ↗</a>
		</div>
	</section>
{:else if activeTab === 'vendor'}
	<!-- Panduan Mitra Penyelenggara -->
	<section style="display: flex; flex-direction: column; gap: 28px;">
		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
				<span style="background: var(--green); color: white; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">1</span>
				<h3 style="margin: 0; font-size: 20px; color: var(--green);">Pendaftaran Akun Penyelenggara / Vendor</h3>
			</div>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 14px;">
				Perusahaan Anda dapat mendaftar langsung melalui formulir pendaftaran mitra. Pilih opsi <strong>Mitra Perusahaan</strong> dan masukkan nama PIC serta alamat email korporat resmi.
			</p>
			<a class="button secondary" href="{resolve('/(app)/register')}?role=VENDOR">Daftar sebagai Penyelenggara Sekarang ↗</a>
		</div>

		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
				<span style="background: var(--green); color: white; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">2</span>
				<h3 style="margin: 0; font-size: 20px; color: var(--green);">Verifikasi Legalitas Perusahaan (Clearance)</h3>
			</div>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 14px;">
				Untuk menjamin rasa aman bagi para pencari kerja, Upstream melakukan verifikasi kepatuhan hukum atas setiap mitra yang membuka lowongan alih daya:
			</p>
			<ul style="color: var(--ink); font-size: 14px; line-height: 1.8; margin-bottom: 14px; padding-left: 20px;">
				<li><strong>Nomor Induk Berusaha (NIB):</strong> Dokumen perizinan berusaha berbasis risiko.</li>
				<li><strong>NPWP Badan Usaha:</strong> Nomor Pokok Wajib Pajak entitas perusahaan yang aktif.</li>
				<li><strong>Perjanjian Kerja Sama (PKS):</strong> Kesepakatan kemitraan platform dan standar kepatuhan ketenagakerjaan.</li>
			</ul>
		</div>

		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
				<span style="background: var(--green); color: white; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-weight: 700;">3</span>
				<h3 style="margin: 0; font-size: 20px; color: var(--green);">Publikasi Lowongan & Manajemen ATS</h3>
			</div>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 14px;">
				Setelah akun diverifikasi, Anda dapat membuat posting lowongan kerja dengan spesifikasi kualifikasi, deskripsi tugas, benefit, dan pola penempatan kerja.
			</p>
			<p style="color: var(--muted); line-height: 1.6;">
				Pelamar yang masuk akan langsung tampil di <strong>Portal Vendor ATS</strong>, lengkap dengan tautan unduh CV dan dokumen terverifikasi untuk memudahkan proses wawancara hingga penawaran kerja.
			</p>
		</div>
	</section>
{:else}
	<!-- Standar Regulasi & Kepatuhan -->
	<section style="display: flex; flex-direction: column; gap: 28px;">
		<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
			<h3 style="margin: 0 0 14px; font-size: 20px; color: var(--green);">Prinsip Fair & Ethical Recruitment</h3>
			<p style="color: var(--muted); line-height: 1.6; margin-bottom: 16px;">
				Upstream berkomitmen pada rekrutmen yang beretika, transparan, dan sesuai dengan Undang-Undang Ketenagakerjaan Republik Indonesia serta regulasi alih daya terkini (UU Cipta Kerja & PP No. 35/2021).
			</p>
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;">
				<div style="border-left: 3px solid var(--green); padding-left: 16px;">
					<strong style="color: var(--ink);">Zero Placement Fee</strong>
					<p style="color: var(--muted); font-size: 13px; margin: 6px 0 0;">Pelamar tidak dipungut biaya apa pun dalam proses pendaftaran, seleksi, maupun penempatan kerja.</p>
				</div>
				<div style="border-left: 3px solid var(--green); padding-left: 16px;">
					<strong style="color: var(--ink);">Jaminan Upah & BPJS</strong>
					<p style="color: var(--muted); font-size: 13px; margin: 6px 0 0;">Mitra penyelenggara wajib memberikan kompensasi sesuai UMP/UMK serta perlindungan BPJS TK dan Kesehatan.</p>
				</div>
				<div style="border-left: 3px solid var(--green); padding-left: 16px;">
					<strong style="color: var(--ink);">Kerahasiaan Dokumen Pribadi</strong>
					<p style="color: var(--muted); font-size: 13px; margin: 6px 0 0;">KTP dan berkas penting dilindungi dan hanya dapat diakses dalam koridor rekrutmen yang sah.</p>
				</div>
			</div>
		</div>
	</section>
{/if}
