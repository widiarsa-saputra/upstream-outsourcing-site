<script lang="ts">
	import { salaryLabel, dateLabel, statusLabel, type PublicJob } from '#lib/marketplace/types.ts';
	let { job }: { job: PublicJob } = $props();
</script>

<div class="job-facts">
	<div><span>Lokasi</span><strong>{job.location}</strong></div>
	<div><span>Pola kerja</span><strong>{statusLabel[job.workMode]}</strong></div>
	<div><span>Hubungan kerja</span><strong>{statusLabel[job.employmentType]}</strong></div>
	<div><span>Kompensasi</span><strong>{salaryLabel(job)}</strong></div>
	<div><span>Kebutuhan talenta</span><strong>{job.openings} orang</strong></div>
	<div><span>Batas lamaran</span><strong>{dateLabel(job.deadline)}</strong></div>
</div>
<div class="job-copy">
	<section>
		<h2>Tentang peran ini</h2>
		<p>{job.description}</p>
	</section>
	<section>
		<h2>Kualifikasi</h2>
		<p>{job.qualifications}</p>
	</section>
	{#if job.benefits}<section>
			<h2>Benefit & dukungan</h2>
			<p>{job.benefits}</p>
		</section>{/if}
	<section>
		<h2>Keperluan Dokumen & Tahapan Fase Program</h2>
		<p class="muted" style="font-size: 13px; margin-bottom: 16px;">
			Program ini memiliki alur seleksi berbasis fase. Pastikan dokumen yang dipersyaratkan telah tersimpan aktif di Document Vault Anda.
		</p>

		<div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
			<!-- Fase 1 -->
			<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 16px;">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
					<span style="font-size: 11px; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.5px;">
						Fase 1 • Registrasi & Kurasi Administrasi
					</span>
					<span style="font-size: 10px; background: #eef5e9; color: var(--green); padding: 2px 8px; border-radius: 4px; font-weight: 600;">
						Fase Awal
					</span>
				</div>
				<p style="font-size: 13px; color: var(--ink); margin: 0 0 8px;">
					Verifikasi kualifikasi awal oleh tim rekrutmen. Berkas diambil otomatis dari Document Vault saat pendaftaran dikirimkan.
				</p>
				<div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px;">
					<span style="background: white; border: 1px solid #c9d8c5; padding: 3px 8px; border-radius: 4px; color: #166534; font-weight: 500;">
						📄 CV / Resume PDF (Wajib)
					</span>
					<span style="background: white; border: 1px solid #c9d8c5; padding: 3px 8px; border-radius: 4px; color: #166534; font-weight: 500;">
						🪪 Kartu Identitas (KTP) (Wajib)
					</span>
				</div>
			</div>

			<!-- Fase 2 -->
			<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 16px;">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
					<span style="font-size: 11px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">
						Fase 2 • Wawancara Kompetensi & Uji Keterampilan
					</span>
					<span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
						Fase Wawancara
					</span>
				</div>
				<p style="font-size: 13px; color: var(--ink); margin: 0 0 8px;">
					Wawancara langsung bersama tim representatif mitra penyelenggara kerja.
				</p>
				<div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px;">
					<span style="background: white; border: 1px solid #bae6fd; padding: 3px 8px; border-radius: 4px; color: #0369a1; font-weight: 500;">
						📜 Portofolio Kerja / Riwayat Proyek (Opsional)
					</span>
					<span style="background: white; border: 1px solid #bae6fd; padding: 3px 8px; border-radius: 4px; color: #0369a1; font-weight: 500;">
						🎓 Ijazah / Sertifikat Keahlian Terkait
					</span>
				</div>
			</div>

			<!-- Fase 3 -->
			<div style="background: #fbfcf9; border: 1px solid var(--line); border-radius: 10px; padding: 16px;">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
					<span style="font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">
						Fase 3 • Offering Letter & Penempatan Kerja
					</span>
					<span style="font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
						Fase Akhir
					</span>
				</div>
				<p style="font-size: 13px; color: var(--ink); margin: 0 0 8px;">
					Penerbitan surat penawaran kerja resmi, penandatanganan perjanjian alih daya, dan orientasi kerja.
				</p>
				<div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px;">
					<span style="background: white; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 4px; color: #92400e; font-weight: 500;">
						📋 Surat Perjanjian Kerja Sama
					</span>
				</div>
			</div>
		</div>

		<!-- Persyaratan Berkas Tambahan Mitra -->
		<h3 style="font-size: 15px; margin: 0 0 8px;">Berkas Tambahan Khusus Mitra</h3>
		<ul class="requirements-list">
			{#each job.requirements as requirement (requirement.code)}
				<li>
					<span>{requirement.name}</span>
					<small>{requirement.required ? 'Wajib' : 'Opsional'}</small>
				</li>
			{:else}
				<li>Tidak ada persyaratan berkas khusus tambahan selain CV & KTP di Vault.</li>
			{/each}
		</ul>
	</section>
</div>
