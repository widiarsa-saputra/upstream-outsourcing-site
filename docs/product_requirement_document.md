# Product Requirement Document (PRD)
## Platform Alih Daya & Rekrutmen (Fase 1: Job-Seeker MVP)

---

### 1. Ringkasan Eksekutif & Visi Produk
* **Nama Produk (Tentatif):** NextForce Portal / OutsourceHub
* **Visi:** Menghubungkan pencari kerja berkualifikasi dengan vendor/perusahaan mitra alih daya, sekaligus memberi kontrol penuh kepada internal staf untuk memvalidasi dokumen, alur seleksi, serta penempatan kerja.
* **Tujuan Fase 1:** Membangun *foundation platform* berkonsep *job board & applicant tracker* yang memfasilitasi 4 entitas: Admin/Staff Internal, Vendor (Mitra Usaha), Job Seeker (Kandidat), dan Pengunjung Publik.

---

### 2. Stakeholder & Persona Pengguna

| Peran | Deskripsi | Akses Utama | Kebutuhan Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin / Staff Internal** | Tim internal platform/pemilik bisnis | Backoffice Admin Panel | Memverifikasi berkas vendor, memoderasi lowongan, memvalidasi dokumen kandidat, dan mengelola operasional. |
| **Vendor (Mitra Usaha)** | Perusahaan klien yang membutuhkan tenaga alih daya | Vendor Dashboard | Membuka lowongan, menentukan syarat dokumen kustom, meninjau pelamar, dan mengelola profil perusahaan. |
| **User (Job Seeker)** | Kandidat pelamar kerja | User Dashboard & Public Portal | Melengkapi profil/CV, mengunggah berkas wajib, mencari lowongan, melamar kerja, dan memantau status lamaran. |
| **Pengunjung Umum** | Publik yang belum terdaftar | Public Job Portal | Menjelajahi daftar lowongan, melihat detail perusahaan vendor, dan melakukan registrasi. |

---

### 3. Arsitektur Modul & Aplikasi

Secara teknis, platform terbagi menjadi 3 modul/aplikasi utama:

1. **Modul 1: Public Job Portal & Landing Page (Web Publik)**
2. **Modul 2: User & Vendor Dual Portal (Protected Web App)**
   - Sub-halaman: *Job Seeker Dashboard & Enrollment Center*
   - Sub-halaman: *Vendor Job & Talent Management Dashboard*
3. **Modul 3: Internal Admin Console (Staff Backoffice)**

---

### 4. Spesifikasi Fungsional Per Modul

#### 4.1. Modul 1: Public Job Portal (Aplikasi Web Publik)
* **Pencarian & Filter Lowongan:**
  * Filter berdasarkan industri, lokasi/tipe kerja (On-site, Remote, Hybrid), rentang gaji, dan nama vendor.
  * *Search bar* berbasis kata kunci (posisi/keahlian).
* **Direktori Vendor:**
  * Profil ringkas vendor (tentang perusahaan, logo, website, daftar lowongan aktif).
* **Halaman Detail Lowongan:**
  * Deskripsi pekerjaan, kualifikasi, benefit, dan daftar berkas wajib yang diminta vendor.
* **Alur Pendaftaran Cepat (Quick Apply/Register):**
  * CTA "Lamar Pekerjaan" mengarahkan pengguna untuk login atau mendaftar instan dengan email/Google Auth.

#### 4.2. Modul 2A: User Dashboard (Job Seeker)
* **Manajemen Profil & CV Digital:**
  * Informasi data diri, pengalaman kerja, pendidikan, dan keahlian teknis.
* **Document Vault (Berkas Pelamar):**
  * Unggah dan kelola berkas universal: KTP, CV/Resume (PDF), Ijazah, Transkrip, Portofolio, SKCK, dan Sertifikasi.
  * Status validasi berkas (Pending, Terverifikasi, Butuh Revisi).
* **Enrollment & Application Tracker:**
  * Tabel riwayat lamaran kerja beserta status per tahapan (*Applied*, *Screening Internal*, *Vendor Review*, *Interview*, *Offered*, *Rejected*).
  * Notifikasi internal jika ada permintaan kelengkapan berkas tambahan dari staf/vendor.

#### 4.3. Modul 2B: Vendor Dashboard (Mitra Usaha)
* **Manajemen Lowongan (Job Management):**
  * *Create, Edit, Pause, Close Job Listing*.
  * Konfigurasi berkas wajib per lowongan (misal: SIM A, Sertifikat K3, Hasil Tes Bebas Narkoba).
* **Applicant Tracking System (ATS Ringan):**
  * Meninjau kandidat yang telah lolos kurasi awal oleh staf internal.
  * Mengunduh berkas kandidat yang telah disanitasi/diverifikasi.
  * Mengubah status pelamar: Panggil Wawancara, Terima, Tolak.
* **Pengaturan Vendor (Vendor Settings):**
  * Legalitas perusahaan (NPWP, NIB, Perjanjian Kerja Sama).
  * Pengaturan notifikasi email dan profil PIC (Person in Charge).

#### 4.4. Modul 3: Staff & Admin Backoffice Console
* **Vendor Clearance & Management:**
  * Verifikasi legalitas vendor baru sebelum mereka diizinkan mempublikasikan lowongan.
* **Job Post Moderation:**
  * *Approve/Reject* lowongan kerja baru untuk memastikan kesesuaian standar upah dan aturan hukum alih daya.
* **Talent Screening & Document Verification:**
  * Validasi berkas user (memastikan KTP, SKCK, dan ijazah valid sebelum diteruskan ke vendor).
  * Fitur *Internal Notes* antar staf untuk evaluasi kandidat.
* **User & Role Management:**
  * Pengaturan hak akses staf (*Super Admin*, *Talent Acquisition Specialist*, *Legal/Compliance*).

---

### 5. Skema Alur Pengguna (User Flow)

```
[Job Seeker] 
   └─ Buka Public Portal -> Pilih Lowongan -> Registrasi/Login
        └─ Lengkapi Data & Unggah Berkas Wajib 
             └─ Submit Lamaran
                  │
                  ▼
[Staff / Admin Review]
   └─ Validasi keabsahan dokumen & kualifikasi dasar
        ├─ [Tidak Sesuai] -> Notifikasi Revisi ke User
        └─ [Lolos Kurasi] -> Diteruskan ke Vendor
                                 │
                                 ▼
[Vendor Dashboard]
   └─ Vendor meninjau kandidat terkurasi
        ├─ Terjadwal Interview
        └─ Diterima -> Masuk tahap kontrak alih daya
```

---

### 6. Persyaratan Non-Fungsional (NFR)

* **Keamanan Data (Data Privacy):** 
  * Enkripsi dokumen sensitif (KTP, NPWP) saat disimpan (*encryption at rest*) dan saat ditransmisikan (*SSL/TLS*).
  * *Watermarking* otomatis pada berkas identitas untuk mencegah penyalahgunaan.
* **Penyimpanan Berkas (Storage & Upload):**
  * Menggunakan *Cloud Object Storage* (misal: AWS S3, Google Cloud Storage, atau Cloudflare R2) dengan *Presigned URL*.
  * Batas ukuran berkas maksimal 5 MB per dokumen (format diizinkan: PDF, JPG, PNG).
* **Performa & Aksesibilitas:**
  * Waktu muat halaman publik < 2 detik.
  * Tampilan responsif (Mobile-first untuk Job Seeker Dashboard dan Desktop-first untuk Vendor/Admin).

---

### 7. Metrik Keberhasilan (KPI Fase 1)

1. **Aktivitas Pelamar:** > 75% pelamar melengkapi dokumen profil hingga tahap "Siap Disalurkan".
2. **Efisiensi Kurasi:** Waktu tim internal memvalidasi dokumen kandidat < 24 jam.
3. **Kepuasan Vendor:** Vendor dapat mempublikasikan lowongan pertama dalam waktu < 10 menit setelah akun disetujui.
4. **Conversion Rate:** Rasio pelamar terverifikasi terhadap total kandidat yang di-hire oleh vendor.

---

### 8. Rencana Tahap Lanjutan (Fase 2 - Menuju Full Outsourcing Engine)
* Modul presensi online & absensi berbasis geolokasi untuk tenaga alih daya aktif.
* Modul penggajian otomatis (*payroll & billing invoice*) dari vendor ke platform dan dari platform ke staf outsourcing.
* Evaluasi kinerja berkala (KPI scoring) pekerja alih daya oleh vendor langsung di platform.