<script lang="ts">
	import { resolve } from '$app/paths';

	let senderName = $state('');
	let senderEmail = $state('');
	let senderPhone = $state('');
	let category = $state('program');
	let message = $state('');
	let isSubmitted = $state(false);
	let isSubmitting = $state(false);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!senderName || !senderEmail || !message) return;

		isSubmitting = true;
		setTimeout(() => {
			isSubmitting = false;
			isSubmitted = true;
		}, 600);
	}

	function handleReset() {
		senderName = '';
		senderEmail = '';
		senderPhone = '';
		category = 'program';
		message = '';
		isSubmitted = false;
	}
</script>

<svelte:head>
	<title>Kontak & Bantuan — Go Career / Upstream</title>
	<meta
		name="description"
		content="Hubungi tim layanan dan konsultasi program Go Career. Dapatkan bantuan pendaftaran program, kemitraan penyelenggara, dan panduan karier."
	/>
</svelte:head>

<section class="public-hero compact" style="margin-bottom: 32px;">
	<div>
		<p class="eyebrow">PUSAT INFORMASI & BANTUAN</p>
		<h1>Terhubung langsung,<br /><em>solusi yang tepat.</em></h1>
		<p>
			Tim konsultan dan operasional kami siap membantu pertanyaan seputar program karier, tahapan berkas di Vault, serta kemitraan penyelenggara kerja.
		</p>
	</div>
</section>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 36px; margin-bottom: 60px;">
	<!-- Kolom 1: Formulir Kontak -->
	<div style="background: white; border: 1px solid var(--line); border-radius: 16px; padding: 36px; box-shadow: 0 4px 18px rgba(0,0,0,0.03);">
		<h2 style="font-size: 24px; color: var(--green); margin-bottom: 8px;">Kirimkan Pesan</h2>
		<p style="font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.5;">
			Silakan isi formulir di bawah ini. Tim kami akan merespons melalui email atau WhatsApp resmi dalam waktu maksimal 1x24 jam kerja.
		</p>

		{#if isSubmitted}
			<div style="background: #edf8eb; border: 1px solid #b8dfb2; border-radius: 12px; padding: 28px; text-align: center;">
				<span style="font-size: 36px; display: block; margin-bottom: 12px;">✅</span>
				<strong style="display: block; font-size: 17px; color: var(--green); margin-bottom: 6px;">Pesan Anda Berhasil Terkirim!</strong>
				<p style="font-size: 13px; color: #446442; line-height: 1.6; margin: 0 0 18px;">
					Terima kasih, <strong>{senderName}</strong>. Rekan tim dukungan kami akan segera meninjau pesan Anda dan menghubungi via <strong>{senderEmail}</strong>.
				</p>
				<button type="button" class="button secondary small" onclick={handleReset}>
					Kirim Pesan Lainnya ↗
				</button>
			</div>
		{:else}
			<form onsubmit={handleSubmit} style="display: flex; flex-direction: column; gap: 18px;">
				<div>
					<label for="contact-name" style="display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px;">
						Nama Lengkap <span style="color: #b91c1c;">*</span>
					</label>
					<input
						id="contact-name"
						type="text"
						required
						bind:value={senderName}
						placeholder="Contoh: Budi Pratama"
						style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; font-size: 13px;"
					/>
				</div>

				<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
					<div>
						<label for="contact-email" style="display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px;">
							Alamat Email <span style="color: #b91c1c;">*</span>
						</label>
						<input
							id="contact-email"
							type="email"
							required
							bind:value={senderEmail}
							placeholder="nama@email.com"
							style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; font-size: 13px;"
						/>
					</div>
					<div>
						<label for="contact-phone" style="display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px;">
							Nomor WhatsApp
						</label>
						<input
							id="contact-phone"
							type="tel"
							bind:value={senderPhone}
							placeholder="0812xxxxxxx"
							style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; font-size: 13px;"
						/>
					</div>
				</div>

				<div>
					<label for="contact-category" style="display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px;">
						Kategori Kepentingan
					</label>
					<select
						id="contact-category"
						bind:value={category}
						style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; font-size: 13px; background: white;"
					>
						<option value="program">Konsultasi Program & Posisi Kerja</option>
						<option value="vault">Kendala Akun / Document Vault</option>
						<option value="mitra">Pendaftaran Mitra Penyelenggara</option>
						<option value="legal">Pertanyaan Regulasi & Kepatuhan</option>
						<option value="lainnya">Pertanyaan Lainnya</option>
					</select>
				</div>

				<div>
					<label for="contact-message" style="display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px;">
						Pesan / Rincian Pertanyaan <span style="color: #b91c1c;">*</span>
					</label>
					<textarea
						id="contact-message"
						rows="4"
						required
						bind:value={message}
						placeholder="Tuliskan pertanyaan atau informasi yang ingin Anda tanyakan..."
						style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; font-size: 13px; resize: vertical;"
					></textarea>
				</div>

				<button
					type="submit"
					class="button primary"
					disabled={isSubmitting}
					style="margin-top: 6px; padding: 12px 20px; font-size: 13px; justify-content: center;"
				>
					{isSubmitting ? 'Mengirim pesan…' : 'Kirim Pesan Sekarang ↗'}
				</button>
			</form>
		{/if}
	</div>

	<!-- Kolom 2: Saluran Narahubung & Kantor -->
	<div style="display: flex; flex-direction: column; gap: 20px;">
		<!-- Kartu Fast Response WhatsApp -->
		<div style="background: #eef7eb; border: 1px solid #c9e6c2; border-radius: 14px; padding: 26px;">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
				<span style="font-size: 26px;">💬</span>
				<div>
					<strong style="display: block; font-size: 16px; color: var(--green);">Konsultasi Cepat WhatsApp</strong>
					<span style="font-size: 12px; color: #496347;">Respon cepat pada jam kerja</span>
				</div>
			</div>
			<p style="font-size: 13px; color: #496347; line-height: 1.5; margin: 0 0 16px;">
				Ingin berkonsultasi seputar kualifikasi program atau verifikasi pendaftaran? Hubungi tim support melalui WhatsApp.
			</p>
			<a
				href="https://wa.me/6281234567890?text=Halo%20Admin%20Go%20Career,%20saya%20ingin%20berkonsultasi%20seputar%20program"
				target="_blank"
				rel="noreferrer"
				class="button primary"
				style="font-size: 12px; padding: 10px 16px;"
			>
				Chat WhatsApp Resmi ↗
			</a>
		</div>

		<!-- Kartu Informasi Kontak Resmi -->
		<div style="background: white; border: 1px solid var(--line); border-radius: 14px; padding: 26px; box-shadow: 0 4px 14px rgba(0,0,0,0.02);">
			<strong style="display: block; font-size: 15px; color: var(--ink); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
				Informasi Narahubung
			</strong>

			<div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
				<div style="display: flex; gap: 12px; align-items: flex-start;">
					<span style="font-size: 18px;">✉️</span>
					<div>
						<strong style="display: block; color: var(--ink);">Email Bantuan & Informasi</strong>
						<a href="mailto:support@gocareer.id" style="color: var(--green); text-decoration: underline;">
							support@gocareer.id
						</a>
						<span style="display: block; font-size: 11px; color: var(--muted);">Untuk kerjasama: partner@gocareer.id</span>
					</div>
				</div>

				<div style="display: flex; gap: 12px; align-items: flex-start;">
					<span style="font-size: 18px;">🏢</span>
					<div>
						<strong style="display: block; color: var(--ink);">Kantor Pusat Operasional</strong>
						<span style="color: var(--muted); line-height: 1.5; display: block;">
							Gedung Graha Upstream Lantai 4<br />
							Kawasan Bisnis Renon, Denpasar, Bali — Indonesia
						</span>
					</div>
				</div>

				<div style="display: flex; gap: 12px; align-items: flex-start;">
					<span style="font-size: 18px;">⏰</span>
					<div>
						<strong style="display: block; color: var(--ink);">Jam Operasional</strong>
						<span style="color: var(--muted); display: block;">
							Senin – Jumat: 08.30 – 17.30 WITA<br />
							Sabtu: 09.00 – 14.00 WITA (Online Support)
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Tautan Cepat FAQ & Panduan -->
		<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 14px; padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
			<div>
				<strong style="display: block; font-size: 14px; color: var(--ink);">Pertanyaan yang Sering Diajukan?</strong>
				<span style="font-size: 12px; color: var(--muted);">Temukan jawaban instan di pusat edukasi kami.</span>
			</div>
			<div style="display: flex; gap: 8px;">
				<a class="button secondary small" href={resolve('/(public)/faq')}>Buka FAQ ↗</a>
				<a class="button secondary small" href={resolve('/(public)/panduan')}>Panduan ↗</a>
			</div>
		</div>
	</div>
</div>
