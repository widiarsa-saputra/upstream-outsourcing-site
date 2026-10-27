<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="public-footer" style="margin-top: 60px; border-top: 1px solid var(--line); padding: 48px 0 32px;">
	<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 36px; flex-wrap: wrap; margin-bottom: 32px;">
		<div style="max-width: 400px;">
			<a class="brand" href={resolve('/')} style="font-size: 24px; font-weight: 700; color: var(--green);">
				upstream.
			</a>
			<p style="margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6;">
				Platform alih daya & rekrutmen terverifikasi di Indonesia. Menghubungkan talenta siap kerja dengan mitra penyelenggara kerja terpercaya dengan jaminan zero placement fee.
			</p>
		</div>

		<div style="display: flex; gap: 36px; font-size: 13px; flex-wrap: wrap;">
			<div style="display: flex; flex-direction: column; gap: 9px;">
				<strong style="color: var(--ink); font-size: 11px; letter-spacing: 0.8px; text-transform: uppercase;">Eksplorasi</strong>
				<a href={resolve('/')}>Beranda</a>
				<a href={resolve('/(public)/jobs')}>Lowongan Kerja</a>
				<a href={resolve('/(public)/vendors')}>Mitra Penyelenggara</a>
			</div>
			<div style="display: flex; flex-direction: column; gap: 9px;">
				<strong style="color: var(--ink); font-size: 11px; letter-spacing: 0.8px; text-transform: uppercase;">Pusat Bantuan</strong>
				<a href={resolve('/(public)/panduan')}>Panduan Pengguna</a>
				<a href={resolve('/(public)/faq')}>FAQ & Pertanyaan Umum</a>
			</div>
			<div style="display: flex; flex-direction: column; gap: 9px;">
				<strong style="color: var(--ink); font-size: 11px; letter-spacing: 0.8px; text-transform: uppercase;">Akses Portal</strong>
				<a href={resolve('/(app)/login')}>Masuk Portal Pelamar</a>
				<a href="{resolve('/(app)/register')}?role=VENDOR" style="color: var(--green); font-weight: 600;">
					Daftar Penyelenggara ↗
				</a>
				<a href={resolve('/(app)/admin/login')} style="color: var(--muted); font-size: 11px;">
					Konsol Staf Admin ↗
				</a>
			</div>
		</div>
	</div>

	<div style="border-top: 1px solid var(--line); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--muted); flex-wrap: wrap; gap: 12px;">
		<span>&copy; {new Date().getFullYear()} Upstream Alih Daya & Talent Network. Hak cipta dilindungi.</span>
		<span>Kepatuhan Ketenagakerjaan RI • Standar UU Cipta Kerja • Zero Placement Fee</span>
	</div>
</footer>
