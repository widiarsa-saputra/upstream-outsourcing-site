<script lang="ts">
	import { resolve } from '$app/paths';
	import { salaryLabel, statusLabel, type PublicJob } from '#lib/marketplace/types.ts';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Application } from '#lib/candidate/applications.ts';

	let {
		job,
		isApplied: isAppliedProp,
		viewMode = 'grid'
	}: { job: PublicJob; isApplied?: boolean; viewMode?: 'grid' | 'list' } = $props();

	const session = useSession('user');

	const myAppsQuery = createQuery(() => ({
		queryKey: ['candidate', session.user?.id, 'applications'],
		enabled: !!session.user && session.user.role === 'CANDIDATE' && isAppliedProp === undefined,
		queryFn: ({ signal }) => session.api.request<Application[]>('/candidate/applications', { signal })
	}));

	const isApplied = $derived(
		isAppliedProp ?? Boolean(myAppsQuery.data?.some((app) => app.jobId === job.id))
	);
</script>

{#if viewMode === 'list'}
	<!-- Tampilan List View -->
	<article
		class="public-job-card-list"
		style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; box-shadow: 0 3px 10px rgba(0,0,0,0.02); transition: border-color 0.15s, box-shadow 0.15s;"
	>
		<div style="display: flex; gap: 16px; align-items: center; min-width: 280px; flex: 1;">
			<span class="company-monogram" style="width: 44px; height: 44px; border-radius: 10px; background: #e7eddf; color: var(--green); font-weight: 700; display: grid; place-items: center; font-size: 15px; flex-shrink: 0;" aria-hidden="true">
				{job.vendor.name.slice(0, 2).toUpperCase()}
			</span>
			<div>
				<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px; flex-wrap: wrap;">
					<span style="font-size: 11px; font-weight: 600; color: #526b4d;">{job.vendor.name}</span>
					<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #f3f5ee; color: var(--green); font-weight: 600;">
						{statusLabel[job.employmentType]}
					</span>
					<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #eef2eb; color: #496347; font-weight: 600;">
						{statusLabel[job.workMode]}
					</span>
					{#if session.user && session.user.role === 'CANDIDATE'}
						{#if isApplied}
							<span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; background: #dcfce7; color: #15803d; border: 1px solid #86efac;">
								✓ DONE
							</span>
						{/if}
					{/if}
				</div>
				<h3 style="margin: 0; font-size: 17px; line-height: 1.3;">
					<a href={resolve('/(public)/layanan/[slug]', { slug: job.slug })} style="color: var(--ink); text-decoration: none;">
						{job.title}
					</a>
				</h3>
				<span style="font-size: 12px; color: var(--muted); margin-top: 4px; display: block;">
					📍 {job.location} • 🏢 {job.industry}
				</span>
			</div>
		</div>

		<div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
			<div style="text-align: right; min-width: 140px;">
				<strong style="display: block; font-size: 13px; color: var(--green);">
					{salaryLabel(job)}
				</strong>
				<span style="font-size: 11px; color: var(--muted);">Gaji transparan</span>
			</div>

			<!-- Dua Tombol Aksi: Detail & Pendaftaran -->
			<div style="display: flex; gap: 8px; align-items: center;">
				<a
					href={resolve('/(public)/layanan/[slug]', { slug: job.slug })}
					class="button secondary small"
					style="font-size: 11px; padding: 7px 12px;"
				>
					Detail ↗
				</a>

				{#if isApplied}
					<a
						href={resolve('/(app)/(protected)/candidate/applications')}
						class="button small"
						style="font-size: 11px; padding: 7px 12px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;"
					>
						✓ Terdaftar
					</a>
				{:else}
					<a
						href={resolve('/(public)/layanan/[slug]', { slug: job.slug })}
						class="button primary small"
						style="font-size: 11px; padding: 7px 12px;"
					>
						Daftar / Lamar ↗
					</a>
				{/if}
			</div>
		</div>
	</article>
{:else}
	<!-- Tampilan Grid View (Default) -->
	<article class="public-job-card" style="display: flex; flex-direction: column; justify-content: space-between;">
		<div>
			<div class="job-card-top">
				<span class="company-monogram" aria-hidden="true"
					>{job.vendor.name.slice(0, 2).toUpperCase()}</span
				>
				<div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end;">
					<span class="job-type">{statusLabel[job.employmentType]}</span>
					<span class="job-type" style="background: #eef2eb; color: #496347;">{statusLabel[job.workMode]}</span>
					{#if session.user && session.user.role === 'CANDIDATE'}
						{#if isApplied}
							<span
								style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; display: inline-flex; align-items: center; gap: 3px;"
								title="Anda telah melamar lowongan ini"
							>
								✓ DONE
							</span>
						{:else}
							<span
								style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;"
								title="Belum diajukan lamaran"
							>
								Belum
							</span>
						{/if}
					{/if}
				</div>
			</div>
			<p class="job-company">{job.vendor.name}</p>
			<h2><a href={resolve('/(public)/layanan/[slug]', { slug: job.slug })}>{job.title}</a></h2>
			<p class="job-card-location">📍 {job.location} <span>·</span> {job.industry}</p>
			<p class="job-card-description">
				{job.description.slice(0, 140)}{job.description.length > 140 ? '…' : ''}
			</p>
		</div>

		<div>
			<div class="job-card-bottom" style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--line);">
				<span>{salaryLabel(job)}</span>
				{#if session.user && session.user.role === 'CANDIDATE' && isApplied}
					<a
						href={resolve('/(app)/(protected)/candidate/applications')}
						style="font-size: 11px; font-weight: 700; color: #0284c7; text-decoration: underline;"
					>
						Status Progres ↗
					</a>
				{/if}
			</div>

			<!-- Dua Tombol Aksi: Detail & Pendaftaran -->
			<div style="display: flex; gap: 8px; align-items: center;">
				<a
					href={resolve('/(public)/layanan/[slug]', { slug: job.slug })}
					class="button secondary"
					style="flex: 1; text-align: center; font-size: 11px; padding: 8px 10px; min-height: 36px; justify-content: center;"
				>
					Detail ↗
				</a>
				{#if isApplied}
					<a
						href={resolve('/(app)/(protected)/candidate/applications')}
						class="button"
						style="flex: 1; text-align: center; font-size: 11px; padding: 8px 10px; min-height: 36px; justify-content: center; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;"
					>
						✓ Terdaftar
					</a>
				{:else}
					<a
						href={resolve('/(public)/layanan/[slug]', { slug: job.slug })}
						class="button primary"
						style="flex: 1; text-align: center; font-size: 11px; padding: 8px 10px; min-height: 36px; justify-content: center;"
					>
						Daftar / Lamar ↗
					</a>
				{/if}
			</div>
		</div>
	</article>
{/if}
