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
		<h2>Berkas yang dibutuhkan</h2>
		<ul class="requirements-list">
			{#each job.requirements as requirement (requirement.code)}<li>
					<span>{requirement.name}</span><small>{requirement.required ? 'Wajib' : 'Opsional'}</small
					>
				</li>{:else}<li>Belum ada persyaratan berkas tambahan.</li>{/each}
		</ul>
	</section>
</div>
