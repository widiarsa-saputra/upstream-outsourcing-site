<script lang="ts">
	import { resolve } from '$app/paths';

	interface FaqItem {
		q: string;
		a: string;
		category: 'umum' | 'pelamar' | 'penyelenggara' | 'dokumen';
	}

	const faqs: FaqItem[] = [
		{
			category: 'umum',
			q: 'Apakah pendaftaran dan melamar pekerjaan di Upstream berbayar?',
			a: 'Tidak. Upstream menerapkan prinsip Zero Placement Fee. Seluruh proses pendaftaran, pembuatan Digital CV, hingga pengajuan lamaran kerja adalah 100% GRATIS bagi semua pencari kerja. Harap waspada terhadap pihak mana pun yang mengatasnamakan Upstream dan meminta imbalan finansial.'
		},
		{
			category: 'umum',
			q: 'Apa perbedaan antara Upstream dengan portal lowongan kerja konvensional?',
			a: 'Upstream adalah ekosistem alih daya dan rekrutmen terverifikasi. Kami memvalidasi legalitas mitra penyelenggara (NIB, NPWP, perizinan berusaha) sebelum mereka dapat membuka lowongan. Selain itu, kandidat dilengkapi Document Vault dan ATS real-time tracking sehingga setiap tahapan seleksi transparan.'
		},
		{
			category: 'pelamar',
			q: 'Dokumen apa saja yang wajib saya unggah sebelum bisa melamar lowongan?',
			a: 'Anda wajib mengunggah minimal 1 CV / Resume aktif berformat PDF di Document Vault Anda. Dokumen KTP juga sangat disarankan untuk mempercepat proses verifikasi identitas saat seleksi kerja berlanjut ke tahap wawancara dan penawaran kerja.'
		},
		{
			category: 'pelamar',
			q: 'Bagaimana cara mengetahui bahwa lamaran saya sudah sampai ke perusahaan?',
			a: 'Begitu Anda menekan tombol "Kirim Lamaran", sistem langsung mencatatnya di backend. Anda dapat memantau statusnya di menu "Status Lamaran" pada Portal Pelamar. Di sana tertulis jelas apakah berkas sedang dikurasi tim internal Upstream, ditinjau mitra, dijadwalkan wawancara, atau diterima.'
		},
		{
			category: 'pelamar',
			q: 'Apakah saya bisa membatalkan lamaran yang sudah saya kirimkan?',
			a: 'Ya. Anda dapat membatalkan lamaran secara mandiri melalui tombol "Tarik Lamaran" di tracker status lamaran Anda selama proses seleksi belum mencapai tahap penawaran resmi atau penutupan formasi.'
		},
		{
			category: 'penyelenggara',
			q: 'Bagaimana cara perusahaan saya mendaftar sebagai mitra penyelenggara lowongan?',
			a: 'Kunjungi halaman pendaftaran, pilih opsi "Mitra Perusahaan", lalu masukkan data PIC dan email perusahaan Anda. Setelah itu, tim kepatuhan Upstream akan memvalidasi kelengkapan berkas legalitas (NIB & NPWP) sebelum akun Anda diaktifkan untuk menerbitkan lowongan.'
		},
		{
			category: 'penyelenggara',
			q: 'Berapa lama proses verifikasi akun penyelenggara / vendor?',
			a: 'Proses verifikasi berkas legalitas perusahaan biasanya memakan waktu 1–2 hari kerja setelah dokumen NIB dan NPWP lengkap diunggah ke sistem clearance kami.'
		},
		{
			category: 'penyelenggara',
			q: 'Apakah mitra penyelenggara bisa mengunduh CV pelamar secara langsung?',
			a: 'Ya. Melalui Portal Vendor ATS, Anda dapat melihat profil kandidat yang melamar, riwayat pengalaman, dan mengunduh berkas CV aktif kandidat secara aman via link unduhan berizin.'
		},
		{
			category: 'dokumen',
			q: 'Apakah berkas identitas dan CV saya aman di Document Vault?',
			a: 'Sangat aman. Seluruh berkas di Document Vault disimpan dalam media penyimpanan terenkripsi. Berkas identitas sensitif (seperti KTP) hanya dapat ditinjau oleh staf verifikasi berwenang untuk validasi kepatuhan, dan tidak dipublikasikan ke publik.'
		},
		{
			category: 'dokumen',
			q: 'Apa batas ukuran berkas yang diperbolehkan di Document Vault?',
			a: 'Ukuran maksimum per berkas adalah 10 Megabyte (MB), dengan format yang didukung meliputi PDF untuk dokumen teks/sertifikat, serta JPG/PNG/WEBP untuk foto kartu identitas.'
		}
	];

	let selectedCategory = $state<'all' | 'umum' | 'pelamar' | 'penyelenggara' | 'dokumen'>('all');
	let searchKeyword = $state('');
	let openIndices = $state<number[]>([0, 1]); // default buka 2 FAQ pertama

	function toggleFaq(index: number) {
		if (openIndices.includes(index)) {
			openIndices = openIndices.filter((i) => i !== index);
		} else {
			openIndices = [...openIndices, index];
		}
	}

	const filteredFaqs = $derived.by(() => {
		return faqs.filter((item) => {
			const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
			const matchesSearch =
				!searchKeyword.trim() ||
				item.q.toLowerCase().includes(searchKeyword.toLowerCase()) ||
				item.a.toLowerCase().includes(searchKeyword.toLowerCase());
			return matchesCategory && matchesSearch;
		});
	});
</script>

<svelte:head>
	<title>Pertanyaan Umum (FAQ) — Upstream</title>
	<meta
		name="description"
		content="Jawaban atas pertanyaan umum seputar pencarian kerja, pendaftaran mitra penyelenggara, Document Vault, dan proses rekrutmen di Upstream."
	/>
</svelte:head>

<section class="public-hero compact" style="margin-bottom: 24px;">
	<div>
		<p class="eyebrow">PUSAT BANTUAN & PERTANYAAN UMUM</p>
		<h1>Pertanyaan yang<br /><em>sering diajukan.</em></h1>
		<p>Temukan jawaban cepat seputar platform Upstream, lamaran kerja, dan kemitraan penyelenggara.</p>
	</div>
</section>

<!-- Filter Kategori & Pencarian -->
<div style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 20px; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
	<div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
		<div style="display: flex; gap: 8px; flex-wrap: wrap;">
			<button
				type="button"
				class="button {selectedCategory === 'all' ? 'primary' : 'secondary'}"
				style="font-size: 12px; padding: 8px 14px; border-radius: 6px;"
				onclick={() => (selectedCategory = 'all')}
			>
				Semua Topik
			</button>
			<button
				type="button"
				class="button {selectedCategory === 'umum' ? 'primary' : 'secondary'}"
				style="font-size: 12px; padding: 8px 14px; border-radius: 6px;"
				onclick={() => (selectedCategory = 'umum')}
			>
				Umum
			</button>
			<button
				type="button"
				class="button {selectedCategory === 'pelamar' ? 'primary' : 'secondary'}"
				style="font-size: 12px; padding: 8px 14px; border-radius: 6px;"
				onclick={() => (selectedCategory = 'pelamar')}
			>
				Pelamar Kerja
			</button>
			<button
				type="button"
				class="button {selectedCategory === 'penyelenggara' ? 'primary' : 'secondary'}"
				style="font-size: 12px; padding: 8px 14px; border-radius: 6px;"
				onclick={() => (selectedCategory = 'penyelenggara')}
			>
				Penyelenggara / Mitra
			</button>
			<button
				type="button"
				class="button {selectedCategory === 'dokumen' ? 'primary' : 'secondary'}"
				style="font-size: 12px; padding: 8px 14px; border-radius: 6px;"
				onclick={() => (selectedCategory = 'dokumen')}
			>
				Dokumen & Keamanan
			</button>
		</div>

		<input
			type="search"
			placeholder="Ketik kata kunci pertanyaan..."
			bind:value={searchKeyword}
			style="max-width: 280px; padding: 8px 12px; font-size: 13px; border: 1px solid var(--line); border-radius: 6px; margin: 0;"
		/>
	</div>
</div>

<!-- Daftar FAQ Accordion -->
<div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px;">
	{#each filteredFaqs as faq, index (faq.q)}
		{@const isOpen = openIndices.includes(index)}
		<div
			style="background: white; border: 1px solid {isOpen ? 'var(--green)' : 'var(--line)'}; border-radius: 10px; overflow: hidden; transition: all 0.2s;"
		>
			<button
				type="button"
				onclick={() => toggleFaq(index)}
				style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; text-align: left; background: none; border: none; cursor: pointer; gap: 16px;"
			>
				<span style="font-weight: 600; font-size: 15px; color: var(--ink);">
					{faq.q}
				</span>
				<span style="font-size: 18px; color: var(--green); font-weight: bold; flex-shrink: 0;">
					{isOpen ? '−' : '+'}
				</span>
			</button>
			{#if isOpen}
				<div style="padding: 0 24px 20px; color: var(--muted); font-size: 14px; line-height: 1.7; border-top: 1px dashed var(--line); margin-top: -4px; padding-top: 14px;">
					{faq.a}
				</div>
			{/if}
		</div>
	{:else}
		<div style="background: white; border: 1px solid var(--line); border-radius: 10px; padding: 36px; text-align: center;">
			<p style="color: var(--muted); margin: 0; font-style: italic;">
				Tidak ada pertanyaan yang sesuai dengan kata kunci "{searchKeyword}".
			</p>
		</div>
	{/each}
</div>

<!-- Kotak Bantuan Tambahan -->
<section style="background: #edf0e6; border: 1px solid var(--line); border-radius: 12px; padding: 32px; display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;">
	<div>
		<p class="eyebrow" style="margin-bottom: 6px;">MASIH MEMERLUKAN BANTUAN?</p>
		<h3 style="margin: 0 0 6px; font-size: 20px; color: var(--green);">Tim Upstream siap membantu Anda.</h3>
		<p style="margin: 0; color: #566753; font-size: 13px;">
			Jika Anda memiliki pertanyaan teknis, kendala dokumen, atau kemitraan khusus, hubungi tim support kami.
		</p>
	</div>
	<div style="display: flex; gap: 12px; flex-wrap: wrap;">
		<a class="button" href="{resolve('/(app)/register')}?role=VENDOR">Daftar sebagai Penyelenggara ↗</a>
		<a class="button secondary" href={resolve('/(public)/panduan')}>Lihat Panduan Lengkap →</a>
	</div>
</section>
