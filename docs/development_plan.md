# Rencana Pengembangan Frontend dan Backend

Tanggal: 27 Oktober 2026. Acuan: `product_requirement_document.md`, fase 1 Job-Seeker MVP.

## 1. Kondisi awal dan keputusan arsitektur

- Frontend sudah menggunakan SvelteKit 3, Svelte 5, TypeScript, Tailwind CSS, npm, Vitest, dan Playwright; aplikasi bisnis belum tersedia.
- Repository backend belum memiliki implementasi. Stack usulan: Node.js LTS + TypeScript + NestJS, PostgreSQL, Prisma, dan OpenAPI. Ini keputusan awal perencanaan, belum instalasi atau implementasi.
- Gunakan modular monolith: auth, users, vendors, jobs, candidates, documents, applications, notifications, dan audit. Belum membutuhkan microservices.
- Object storage kompatibel S3 untuk dokumen privat; worker untuk pemeriksaan file, watermark, dan email. Redis + BullMQ dapat dipakai sebagai antrean worker, bukan sumber data utama.
- Browser dashboard mengakses REST API backend langsung. Backend menyediakan endpoint JSON publik dan privat; halaman UI tetap berada di SvelteKit.
- Pisahkan development, staging, production; gunakan migrasi database, bucket, kredensial, dan domain masing-masing.

## 2. Pembagian halaman dan rendering

| Area     | Halaman                                                                                                                                 | Rendering dan akses data                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Publik   | Landing, daftar/detail lowongan, direktori/detail vendor                                                                                | Landing prerender; data lowongan/vendor SSR melalui API publik dan navigasi interaktif |
| Auth     | Login, register kandidat/vendor, verifikasi email, lupa/reset password, callback Google                                                 | CSR; endpoint auth memiliki pembatasan khusus                                          |
| Kandidat | Ringkasan, profil, pengalaman, pendidikan, skills, dokumen, lowongan tersimpan jika ditambahkan, lamaran, notifikasi                    | CSR + TanStack Query; fitur lowongan tersimpan bukan lingkup wajib MVP                 |
| Vendor   | Ringkasan, profil/legalitas, lowongan, editor persyaratan, pelamar, detail kandidat terkurasi, pengaturan PIC/notifikasi                | CSR + TanStack Query                                                                   |
| Internal | Ringkasan, vendor clearance, moderasi lowongan, kandidat, verifikasi dokumen, screening lamaran, catatan internal, staf/role, audit log | Seluruh request API bisnis dari browser melalui TanStack Query                         |

Struktur route yang direncanakan:

```text
src/routes/
  (public)/                 # /, /jobs, /jobs/[slug], /vendors, /vendors/[slug]
  (auth)/                   # /login, /register, /forgot-password, /reset-password
  (protected)/
    +layout.ts              # ssr=false, csr=true
    +layout.svelte          # auth bootstrap + QueryClientProvider
    candidate/
    vendor/
    admin/
src/lib/
  api/                      # HTTP client, typed errors, generated OpenAPI types
  auth/                     # token storage, session state, permissions
  queries/                  # query keys, query/mutation factories per domain
  components/               # form, table, pagination, upload, feedback
  features/                 # auth, jobs, candidates, vendors, admin
```

CSR hanya diterapkan pada layout privat, bukan root aplikasi. Admin tidak memakai server load, server actions, remote functions server, atau proxy SvelteKit untuk request API bisnis. Pembacaan localStorage hanya di browser. Halaman publik tidak memerlukan token dan tidak boleh mengambil data melalui endpoint admin.

## 3. Login JWT dan lifecycle sesi

### Kontrak yang dipilih

- Access token berupa JWT disimpan di localStorage, misalnya `upstream.access_token`, dengan masa berlaku awal 15 menit.
- Browser mengirim `Authorization: Bearer <access_token>` ke endpoint privat. Jangan kirim token melalui query string atau mencatatnya di log.
- Refresh token berupa nilai acak opaque disimpan di cookie HttpOnly, Secure, SameSite=Lax; server menyimpan hash, expiry, dan status pencabutan. Usulan masa berlaku 7 hari, dengan rotasi setiap refresh.
- Deployment yang diasumsikan: frontend dan API memakai HTTPS pada subdomain satu site. Refresh memakai credentials, validasi Origin/CSRF, dan CORS exact allowlist. Jika domain berbeda site, konfigurasi cookie dan CSRF perlu disesuaikan sebelum rilis.
- JWT memuat `sub`, `sid`, `iss`, `aud`, `iat`, `exp`, dan `jti`. Tidak memuat KTP, dokumen, password, atau data pribadi sensitif.
- Backend memverifikasi signature dengan algoritma yang diizinkan, issuer, audience, expiry, serta sesi dan status akun. Role/permission terbaru dibaca dari server agar pencabutan akses segera berlaku.

### Urutan login dan pemulihan sesi

1. Login email/password divalidasi backend; password di-hash Argon2id. Respons mengembalikan access token dan memasang refresh cookie.
2. Browser menyimpan access token, lalu mengambil `/auth/me` sebelum menampilkan halaman privat dan menentukan tujuan berdasarkan role.
3. Saat reload: state awal `initializing`; baca token, validasi melalui `/auth/me`, atau coba refresh bila token tidak ada/kedaluwarsa. Query data bisnis belum berjalan sampai sesi siap.
4. Bila API membalas 401, jalankan satu refresh bersama untuk request bersamaan, simpan access token baru, lalu ulang request maksimal satu kali. Jangan refresh berulang untuk endpoint login/refresh.
5. Bila refresh gagal, kosongkan token dan seluruh cache privat, lalu arahkan ke login. Status 403 menampilkan akses ditolak tanpa memicu refresh.
6. Logout mencabut sesi refresh di backend, menghapus cookie/token/cache, membatalkan request aktif, dan menyinkronkan logout antar-tab melalui storage event/BroadcastChannel. Rotasi refresh juga harus dikoordinasikan antar-tab agar tidak terjadi refresh bersamaan.
7. Reset password, akun dinonaktifkan, dan tindakan keamanan dapat mencabut seluruh sesi. Token reset/verifikasi sekali pakai, di-hash, dan memiliki expiry.
8. Google login memakai authorization code + PKCE, state, dan nonce; callback bertukar kode melalui backend. Access/refresh token aplikasi tidak ditaruh di URL; setelah sukses ikuti bootstrap sesi yang sama. Akun Google tidak dapat memilih role internal.

Registrasi publik hanya mengizinkan kandidat atau vendor pending. Staf diundang oleh superadmin; superadmin awal dibuat melalui command provisioning, tanpa password default di source code. Tautan `returnTo` setelah login harus berupa path internal yang divalidasi.

**Tradeoff localStorage:** JavaScript pada origin yang sama bisa membaca token, sehingga XSS dapat mencurinya. Tetap mengikuti permintaan localStorage untuk access token; refresh token tidak disimpan di sana. Terapkan CSP, sanitasi rich text lowongan/catatan yang dirender, hindari HTML mentah, audit dependency, dan jangan persist cache dokumen/PII di localStorage. TTL pendek membatasi dampak tetapi tidak menghilangkan risiko XSS.

## 4. TanStack Query pada Svelte

- Gunakan `@tanstack/svelte-query` yang kompatibel dengan Svelte 5; kunci versi setelah memverifikasi kompatibilitas. Gunakan API reaktif sesuai dokumentasi versi terpasang.
- Satu QueryClient untuk sesi browser privat; QueryClientProvider di layout protected. Form state dan UI state tetap memakai state Svelte.
- Query key menyertakan domain, identitas sesi/user/vendor, filter, sorting, dan pagination; jangan menyertakan token. Contoh konseptual: `['admin', userId, 'vendors', filters]`.
- Semua query privat memakai syarat `enabled` setelah bootstrap auth selesai. Menu berbasis permission membantu UX; backend tetap memeriksa izin.
- HTTP client terpusat mengatur base URL, Bearer header, timeout/abort, refresh, serta error terstruktur. AbortSignal query diteruskan ke fetch.
- Search debounce sekitar 300 ms; filter/pagination ditaruh di URL. Pagination dan sorting dikerjakan backend, bukan mengunduh semua data.
- Default awal stale time 30 detik; retry terbatas hanya untuk network error/5xx, tidak untuk 401/403/422. Mutation tidak otomatis retry tanpa idempotency.
- Setelah approve/reject/update, invalidasi detail, daftar, badge antrean, dan statistik terkait. Aksi sensitif memakai konfirmasi dan hasil server, tanpa optimistic approval.
- Cache privat dibersihkan pada logout/pergantian akun. Respons privat `Cache-Control: no-store`; jangan cache API privat/dokumen di service worker atau CDN.
- Setiap halaman memiliki loading, kosong, error/retry, forbidden, serta mutation pending. Cegah klik submit ganda dan tampilkan error validasi per field.

## 5. Role dan pembatasan data

| Role               | Cakupan                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Public             | Lowongan published dari vendor approved, profil vendor publik, master data filter                                              |
| Candidate          | Profil/dokumen/lamaran/notifikasi milik sendiri                                                                                |
| Vendor             | Profil dan lowongan vendor tempatnya menjadi anggota; hanya pelamar yang sudah dirilis internal untuk lowongan vendor tersebut |
| Talent Acquisition | Screening kandidat/lamaran dan verifikasi dokumen sesuai permission; catatan internal                                          |
| Legal/Compliance   | Review legalitas vendor, moderasi sesuai permission, dan dokumen yang memang diperlukan                                        |
| Superadmin         | Konfigurasi role/staf dan seluruh operasional yang diizinkan; akses data sensitif tetap dicatat                                |

Terapkan RBAC dengan permission seperti `vendor.verify`, `job.moderate`, `document.verify`, `application.screen`, `staff.manage`. Tambahkan pemeriksaan ownership dan vendor membership pada setiap object, termasuk download. Mengetahui ID tidak memberikan akses. Catatan internal dan alasan internal tidak pernah masuk serializer kandidat/vendor. Dokumen vault tidak otomatis terlihat oleh semua vendor.

## 6. Model data inti

| Entitas                                             | Isi dan aturan penting                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| users, identities, sessions                         | Email unik, hash password, status/verifikasi, provider Google, sesi refresh/revocation                                  |
| roles, permissions, user_roles                      | Role internal dan permission eksplisit                                                                                  |
| candidate_profiles, experiences, educations, skills | Profil kandidat dan histori terstruktur                                                                                 |
| vendors, vendor_members, vendor_documents           | Profil publik terpisah dari legalitas/PIC privat; status approval dan alasan review                                     |
| jobs, job_document_requirements                     | Vendor owner, slug unik, lokasi/industri/mode kerja, gaji/currency/periode/visibility, moderation dan publication state |
| documents, document_versions, document_reviews      | Owner, jenis, object key, ukuran/hash/MIME terverifikasi, status scanning dan review, sanitized key, reviewer           |
| applications, application_documents                 | Unique kandidat+lowongan; snapshot persyaratan dan versi dokumen saat apply                                             |
| application_status_events, internal_notes           | Transisi, actor, timestamp, alasan, visibility, version untuk concurrent update                                         |
| notifications, notification_preferences             | Notifikasi in-app, unread/read, preferensi email                                                                        |
| audit_logs, outbox_events                           | Audit aksi sensitif dan event transaksional untuk email/worker                                                          |

Gunakan foreign key, transaksi, timestamps UTC, indeks status/vendor/lokasi/tanggal, dan pagination stabil. Mulai keyword search dengan fasilitas PostgreSQL; indeks ditentukan dari query yang diukur. Data sensitif tidak dimasukkan ke search publik. Kebijakan retensi dan penghapusan kandidat/dokumen perlu diputuskan sebelum production.

## 7. Workflow dan aturan bisnis

**Vendor:** draft → pending → approved / revision_required / rejected; approved dapat suspended. Vendor pending boleh melengkapi profil dan draft lowongan, tetapi tidak mempublikasikan. Suspension menyembunyikan lowongan dari publik dan menghentikan apply baru.

**Lowongan:** pisahkan status moderasi `draft / pending / approved / rejected / revision_required` dan publikasi `unpublished / published / paused / closed`. Publish membutuhkan vendor approved dan moderasi approved. Perubahan material pada lowongan approved harus dimoderasi ulang; usulan MVP menyembunyikan lowongan selama review ulang. Close tidak menghapus lamaran lama.

**Dokumen:** status proses upload/scanning dipisahkan dari review `pending / verified / revision_required / rejected`. Reupload membuat versi baru yang harus diperiksa ulang; snapshot lamaran lama tidak ditimpa diam-diam.

**Lamaran:** applied → screening_internal → vendor_review → interview → offered; rejected dapat berasal dari tahap screening/vendor/interview/offered sesuai permission. Tambahkan hired untuk merekam penerimaan tawaran dan withdrawn untuk pembatalan kandidat, agar KPI hire dapat dihitung. Kontrak, payroll, dan penempatan operasional lengkap tetap fase 2.

- Permintaan kelengkapan adalah task `action_required` beserta notifikasi, bukan mengganti tahapan lamaran secara ambigu.
- Apply membutuhkan akun terverifikasi, profil minimum, semua dokumen wajib tersedia dan lolos scanning; review staf boleh masih pending agar sesuai alur PRD. Forward ke vendor hanya setelah dokumen wajib verified dan screening lulus.
- Backend memeriksa ulang lowongan/vendor aktif, deadline, syarat dokumen, dan unique lamaran di dalam transaksi. Constraint database mencegah apply ganda.
- Persyaratan kustom dipetakan ke tipe dokumen terstruktur; persyaratan dan versi dokumen disnapshot saat apply.
- Vendor hanya dapat mengakses versi dokumen terverifikasi/sanitized yang dilampirkan pada lamaran yang sudah dirilis; bukan seluruh vault kandidat.
- Semua transisi divalidasi backend dan menghasilkan histori/audit/notifikasi. Gunakan version check untuk mencegah dua reviewer saling menimpa hasil.

## 8. Rencana endpoint REST

Prefix `/api/v1`; tabel berikut adalah kontrak awal, bukan semua detail field.

| Akses                   | Endpoint utama                                                                                                                                  | Fungsi                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Public read             | `GET /public/jobs`, `/public/jobs/:slug`                                                                                                        | Daftar, filter, detail lowongan published                     |
| Public read             | `GET /public/vendors`, `/public/vendors/:slug`, `/public/reference-data`                                                                        | Profil publik dan filter                                      |
| Auth anonymous terbatas | `POST /auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`                                     | Akun dan pemulihan; rate limit, respons anti-enumerasi        |
| Auth Google             | `GET /auth/google/authorize`, `POST /auth/google/exchange`                                                                                      | Mulai OAuth dan pertukaran code tervalidasi                   |
| Refresh session         | `POST /auth/refresh`, `/auth/logout`                                                                                                            | Refresh cookie + perlindungan CSRF/Origin; logout idempotent  |
| JWT semua role          | `GET /auth/me`, `GET /me/sessions`, `DELETE /me/sessions/:id`                                                                                   | Identitas/permission dan pencabutan sesi sendiri              |
| JWT kandidat            | `GET/PATCH /candidate/profile`, CRUD `/candidate/experiences`, `/candidate/educations`, `/candidate/skills`                                     | Profil/CV digital                                             |
| JWT owner               | `POST /documents/upload-intents`, `POST /documents/:id/complete`, `GET /documents`, `DELETE /documents/:id`, `POST /documents/:id/download-url` | Lifecycle dokumen dengan ownership; list mengikuti scope role |
| JWT kandidat            | `POST /candidate/applications`, `GET /candidate/applications`, `GET /candidate/applications/:id`, `POST /candidate/applications/:id/withdraw`   | Apply dan tracker                                             |
| JWT vendor              | `GET/PATCH /vendor/profile`, `POST /vendor/submit-verification`, CRUD `/vendor/legal-documents`                                                 | Profil dan pengajuan clearance                                |
| JWT vendor              | CRUD `/vendor/jobs`, `POST /vendor/jobs/:id/{submit,publish,pause,close}`                                                                       | Manajemen lowongan dan persyaratan                            |
| JWT vendor              | `GET /vendor/applications`, `GET /vendor/applications/:id`, `POST /vendor/applications/:id/transitions`                                         | Kandidat terkurasi dan keputusan vendor                       |
| JWT internal            | `GET /admin/overview`, `GET /admin/vendors`, `GET /admin/vendors/:id`, `POST /admin/vendors/:id/reviews`                                        | Dashboard dan clearance                                       |
| JWT internal            | `GET /admin/jobs`, `GET /admin/jobs/:id`, `POST /admin/jobs/:id/reviews`                                                                        | Moderasi lowongan                                             |
| JWT internal            | `GET /admin/candidates`, `/admin/candidates/:id`, `GET /admin/documents`, `POST /admin/documents/:id/reviews`                                   | Talent dan review dokumen                                     |
| JWT internal            | `GET /admin/applications`, `/admin/applications/:id`, `POST /admin/applications/:id/transitions`, CRUD `/admin/applications/:id/notes`          | Screening dan catatan                                         |
| JWT superadmin          | CRUD `/admin/staff`, `/admin/roles`, `GET /admin/audit-logs`                                                                                    | User/role management dan audit                                |
| JWT semua role          | `GET /notifications`, `PATCH /notifications/:id/read`, `GET/PATCH /me/notification-preferences`                                                 | Notifikasi sesuai pemilik                                     |

CRUD tidak berarti semua operasi bebas: delete staff menonaktifkan akun; role sistem terlindungi; data berelasi mengikuti kebijakan arsip/retensi. Vendor tidak boleh menghapus lamaran kandidat atau memberi status screening internal.

API memakai validasi server, batas page size, allowlist sort/filter, dan error `{ code, message, fieldErrors, requestId }`. Bedakan 401, 403, 404, 409, 422, 429. OpenAPI menjadi sumber kontrak tipe frontend. API publik mengembalikan field allowlist, tanpa legalitas, PIC privat, internal notes, object key, maupun URL dokumen sensitif. Endpoint browser publik tidak memakai private API key; secret backend tidak pernah ditanam dalam bundle frontend.

## 9. Upload dan keamanan dokumen

1. Pemilik meminta upload intent; backend memvalidasi tipe dokumen, MIME yang diklaim, kuota, dan batas 5 MB, lalu menerbitkan signed upload dengan object key acak milik server.
2. Browser upload langsung ke bucket karantina privat. Kebijakan storage membatasi ukuran bila didukung; backend tetap memeriksa metadata dan ukuran aktual pada complete.
3. Complete upload bersifat idempotent; worker memverifikasi signature file/MIME aktual, scan malware, dan memproses file PDF/JPG/PNG. File tidak dapat diunduh sebelum aman.
4. Identitas dibuat versi sanitized/watermark sesuai kebijakan; original terenkripsi dan hanya dapat diakses petugas berwenang bila diperlukan. Jangan menerima SVG/HTML atau mengandalkan extension.
5. Download URL baru diterbitkan setelah pemeriksaan permission, ownership/vendor, status review, dan keterkaitan lamaran. URL singkat, misalnya 60 detik; perlakukan sebagai bearer capability yang tetap berlaku sampai expiry.
6. Catat siapa mengakses dokumen dan tujuan lamaran; jangan mencatat isi dokumen/token/signed URL. Bersihkan orphan upload dan tetapkan retensi original/versi.

## 10. Tahapan implementasi dan hasil penerimaan

Estimasi awal 8–10 minggu untuk satu frontend engineer dan satu backend engineer penuh waktu, dengan QA/product support. Ini asumsi kapasitas, bukan komitmen; evaluasi setelah kontrak API dan vertical slice pertama.

| Tahap                    | Perkiraan   | Backend                                                                          | Frontend                                                                      | Syarat selesai                                                      |
| ------------------------ | ----------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 0. Foundation            | Minggu 1    | Bootstrap, schema, migrasi, OpenAPI, error, CI, storage dev                      | Route groups, design tokens/layout, API client, Query provider                | Build/check berjalan, kontrak auth dan pagination disepakati        |
| 1. Auth/RBAC             | Minggu 2    | Register/login, refresh rotation, Google, reset/verifikasi, role/ownership       | Halaman auth, bootstrap, guard, session expiry/logout                         | Reload bertahan, refresh tidak loop, akses lintas role ditolak      |
| 2. Vendor + jobs         | Minggu 3–4  | Vendor/legalitas, upload dasar, clearance, CRUD jobs, moderation, public reads   | Vendor onboarding/job editor, admin clearance/moderation, public jobs/vendors | Vendor approved → job approved → muncul publik; pending tersembunyi |
| 3. Kandidat + dokumen    | Minggu 5    | Profil/CV, versi dokumen, scan/watermark, review                                 | Profil, vault, upload/revisi, antrean review admin                            | Dokumen invalid ditolak dan file privat tidak bocor                 |
| 4. Apply + ATS           | Minggu 6–7  | Apply transaction, snapshots, screening/transitions, notes, notifications/outbox | Apply, tracker, screening admin, ATS vendor, notifikasi                       | Alur kandidat → staf → vendor → offered/hired berjalan dan teraudit |
| 5. Operasional + release | Minggu 8–10 | Role/staf, audit, metrik, backup/restore, tuning, observability                  | Admin overview, permissions UX, responsive/a11y, error recovery               | UAT, security/access tests, performa dan runbook rilis disetujui    |

Fitur minimum admin: kartu statistik dan antrean review, daftar/detail vendor, daftar/detail lowongan, daftar/detail kandidat, preview/review dokumen, screening/forward lamaran, internal notes, staf/permission, serta audit log. Filter, pagination, loading/error, dan alasan keputusan berlaku konsisten.

## 11. Verifikasi dan release gate

- Backend integration tests: anonymous vs JWT, permission/ownership, vendor cross-tenant, pending vendor/job invisibility, status transitions, duplicate apply, concurrent review, refresh rotation/reuse/logout/revocation.
- Dokumen: oversized, MIME palsu, malware/rejected processing, akses original vs sanitized, signed URL unauthorized, dan file versi lama.
- Frontend unit/component pada auth bootstrap, refresh single-flight, cache cleanup, dan mutation invalidation penting. Playwright untuk tiga perjalanan end-to-end: kandidat apply, staf approve/forward, vendor review/interview/offer.
- Buktikan CSR admin: direct navigation/reload tidak memicu fetch bisnis dari server SvelteKit; Network browser menunjukkan request langsung ke API dan tidak ada data privat dalam HTML/prerender.
- Periksa tidak ada token di URL/log, tidak ada PII di API publik, dan perubahan role/disable akun berlaku pada sesi aktif.
- Target publik <2 detik perlu definisi kondisi uji; usulan ukur LCP p75 pada profil mobile yang disepakati. Gunakan SSR/prerender, optimasi gambar, pagination, dan cache API publik dengan invalidasi ketika job/vendor berubah.
- CI: frontend check/lint/build dan test relevan; backend typecheck/lint/integration/migration checks. Staging UAT, health/readiness, requestId, error tracking yang menyaring PII, alert worker gagal, dan backup dengan uji restore sebelum production.
- Ukur KPI PRD dari event: completion profil/dokumen, waktu pending→verified, approval vendor→job pertama published, serta hired dibanding kandidat terverifikasi. Rumus denominator dan rentang waktu disepakati agar conversion tidak ambigu.

## 12. Keputusan produk yang perlu dipastikan saat kickoff

Rencana dapat dimulai dengan asumsi di atas. Sebelum modul terkait dirilis, pastikan: field profil wajib; daftar dokumen universal vs wajib per lowongan; akses dokumen per role legal/TA/vendor; kapan kandidat menerima tawaran dan dicatat hired; aturan gaji/deadline/reapply; retensi/penghapusan data; provider storage/email/Google; domain deployment; dan siapa yang boleh mengundang PIC vendor tambahan. Multi-PIC dimodelkan sejak awal, tetapi UI undangan dapat ditunda bila tidak dibutuhkan MVP.

Di luar fase 1: presensi, payroll, billing, kontrak digital penuh, dan evaluasi pekerja. Tidak dimasukkan ke estimasi MVP.

## Referensi teknis

- [SvelteKit page options: SSR/CSR per route](https://svelte.dev/docs/kit/page-options)
- [TanStack Query untuk Svelte](https://tanstack.com/query/latest/docs/framework/svelte/overview)
- [OWASP HTML5 Security: risiko penyimpanan sesi di localStorage](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
