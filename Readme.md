# 🏥 RSI Medika — Hospital Management & HRIS System

Sistem Informasi Manajemen Rumah Sakit Terpadu untuk **RSI Medika**. Aplikasi ini mencakup portal kepegawaian (HRIS), penjadwalan dinas/shift tenaga medis, absensi, pengajuan cuti, serta sistem penggajian (payroll) otomatis berbasis pedoman tarif tenaga medis.

---

## 📑 Daftar Isi

- [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
- [Struktur Proyek](#-struktur-proyek)
  - [Frontend (`web-fe`)](#1-frontend-web-fe)
  - [Backend (`web-be`)](#2-backend-web-be)
- [Peran Pengguna & Modul](#-peran-pengguna--modul)
- [Struktur Database](#-struktur-database)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
  - [Prasyarat](#prasyarat)
  - [Setup Backend (`web-be`)](#setup-backend-web-be)
  - [Setup Frontend (`web-fe`)](#setup-frontend-web-fe)
- [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
- [Daftar Perintah (NPM Scripts)](#-daftar-perintah-npm-scripts)
- [Konvensi Kode & Arsitektur](#-konvensi-kode--arsitektur)

---

## 🚀 Arsitektur & Tech Stack

Repositori ini menggunakan struktur monorepo terpisah untuk frontend dan backend:

### Frontend (`web-fe`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server/Client Components)
- **Library UI**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Architecture**: *Feature-Driven Architecture* (pemisahan domain bisnis, routing, dan shared components)

### Backend (`web-be`)
- **Runtime & Framework**: [Node.js](https://nodejs.org/) (ES Modules) & [Express 5](https://expressjs.com/)
- **Database & Auth Platform**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM / Database Client**: [Prisma ORM 6](https://www.prisma.io/) & `@supabase/supabase-js`
- **Security & Utilities**: Helmet, CORS, Morgan, Dotenv

---

## 📂 Struktur Proyek

```
RSI(Medika)/
├── Readme.md               # Dokumentasi utama proyek
├── web-be/                 # Backend REST API (Express + Supabase/Prisma)
└── web-fe/                 # Frontend Web Application (Next.js 16 + Tailwind CSS)
```

---

### 1. Frontend (`web-fe`)

Frontend dibangun menggunakan Next.js App Router dengan pemisahan per peran pengguna (role-based) dan prinsip *feature-driven development*:

```
web-fe/
├── docs/
│   └── architecture.md     # Panduan arsitektur frontend
├── public/                 # Aset statis publik (logo, icons svg, gambar)
├── src/
│   ├── app/                # Next.js App Router (hanya routing & komposisi halaman)
│   │   ├── (dashboard)/    # Route group dashboard dengan otentikasi
│   │   │   ├── hrd/        # Halaman dashboard, kepegawaian, absensi, gaji, pedoman-gaji, aju-banding
│   │   │   ├── keuangan/   # Halaman dashboard, kelola-gaji, pedoman-gaji, aju-banding, profil
│   │   │   ├── sekretaris/ # Halaman dashboard, jadwal, absensi, gaji, profil
│   │   │   ├── tenaga-medis/# Halaman dashboard, jadwal, absensi, gaji, profil
│   │   │   └── layout.tsx  # Layout bersama dashboard (Sidebar + Header + Breadcrumb)
│   │   ├── (public)/       # Halaman publik non-auth
│   │   │   └── login/      # Halaman Login
│   │   ├── layout.tsx      # Root layout aplikasi (Auth Provider, font, metadata)
│   │   ├── page.tsx        # Redirect root / entry point
│   │   └── globals.css     # Konfigurasi Tailwind CSS v4 & custom tokens
│   ├── features/           # Modul domain bisnis mandiri (Feature-driven)
│   │   ├── auth/           # Otentikasi & session logic
│   │   ├── dashboard/      # Widget, statistik ringkasan, dan grafik
│   │   ├── dokter/         # Logika domain dokter
│   │   ├── farmasi/        # Logika domain resep & obat farmasi
│   │   ├── janji-temu/     # Manajemen janji temu pasien
│   │   ├── pasien/         # Manajemen data rekam & pendaftaran pasien
│   │   └── rekam-medis/    # Pencatatan rekam medis elektronik
│   └── shared/             # Komponen & utilitas yang dapat digunakan ulang
│       ├── components/     # UI primitives & layout components (Sidebar, Header, Modal)
│       ├── hooks/          # Custom React hooks bersama
│       ├── lib/            # Utility functions (cn, formatters, helpers)
│       ├── providers/      # Context providers (AuthProvider, ThemeProvider)
│       ├── services/       # HTTP Client & wrapper API
│       ├── styles/         # Token styling tambahan
│       └── types/          # Definisi tipe TypeScript global & peran pengguna
├── next.config.ts          # Konfigurasi Next.js, Turbopack, dan redirects URL lama
├── package.json
└── tsconfig.json
```

Setiap modul di dalam `src/features/<domain>/` memiliki struktur seragam:
- `api.ts`: Pemanggilan endpoint API.
- `hooks.ts`: React hooks untuk state atau query data.
- `types.ts`: Tipe data khusus modul tersebut.
- `components/`: Komponen presentasional privat modul.
- `containers/`: Komponen perakit/kontainer alur bisnis.

---

### 2. Backend (`web-be`)

Backend menyediakan REST API modular yang terhubung langsung ke PostgreSQL Supabase:

```
web-be/
├── database/
│   ├── schema.sql          # Skema DDL lengkap: 17 tabel, sequence ID, constraint, index, RPC
│   └── seed.sql            # Data awal (dummy data) untuk testing
├── prisma/
│   └── schema.prisma       # Model Prisma ORM tersinkronisasi dengan database
├── scripts/
│   └── run-sql.js          # Skrip eksekusi file SQL langsung ke PostgreSQL via pg
├── src/
│   ├── config/             # Konfigurasi lingkungan & database client
│   │   ├── env.js          # Validasi & ekspor environment variables
│   │   ├── prisma.js       # Instance Prisma Client
│   │   └── supabase.js     # Instance Supabase Client (Service Role / Anon)
│   ├── controllers/        # Handler logika bisnis endpoint API
│   ├── middlewares/        # Middlewares (error handling, auth, logger)
│   ├── routes/             # Definisi rute Express
│   │   └── index.js        # Aggregator rute utama
│   ├── utils/              # Helper utilitas (ApiError, asyncHandler, response formatting)
│   ├── app.js              # Inisialisasi Express & konfigurasi middleware global
│   └── server.js           # Entry point listener server HTTP
├── .env.example            # Template konfigurasi environment backend
├── package.json
└── Readme.md               # Dokumentasi teknis backend
```

---

## 👥 Peran Pengguna & Modul

Aplikasi mendukung 4 peran (Role) utama yang memiliki hak akses dan antarmuka khusus:

| Peran | Ruang Lingkup & Fitur Utama |
|---|---|
| **Tenaga Medis** | <ul><li>Melihat jadwal shift & jadwal dinas pribadi</li><li>Melakukan absensi mandiri & pengajuan izin/koreksi absensi</li><li>Melihat rincian slip gaji bulanan & komponen insentif</li><li>Mengajukan cuti dan pengajuan banding gaji</li><li>Pengaturan profil dokter/perawat</li></ul> |
| **HRD (SDM & Personalia)** | <ul><li>Kelola data master pegawai (medis & non-medis)</li><li>Rekapitulasi dan approval absensi, izin, cuti, serta koreksi presensi</li><li>Pemeliharaan data peran tenaga medis & pedoman penggajian</li><li>Monitoring status penggajian dan tindak lanjut aju banding gaji</li></ul> |
| **Sekretaris** | <ul><li>Pengaturan dan plotting jadwal shift tenaga medis di unit terkait</li><li>Monitoring presensi harian staf dan dokter unit</li><li>Melihat data jadwal, absensi unit, dan informasi gaji terkait</li></ul> |
| **Keuangan** | <ul><li>Perhitungan dan pemrosesan penggajian bulanan otomatis</li><li>Penyesuaian pedoman tarif penggajian & insentif jasa medis</li><li>Verifikasi dan persetujuan pengajuan banding gaji</li><li>Pencatatan rekening dan transaksi pembayaran gaji</li></ul> |

---

## 🗄️ Struktur Database

Database dibangun di PostgreSQL (Supabase) dengan skema relasional terpadu:

1. **Pegawai & Akun**:
   - `pegawai`: Data identitas staf/karyawan, NIP, peran, unit kerja.
   - `akun`: Kredensial login, email, role (`TENAGA_MEDIS`, `HRD`, `SEKRETARIS`, `KEUANGAN`).
   - `peran_tenaga_medis`: Master spesialisasi medis (Dokter Spesialis, Dokter Umum, Perawat, Apoteker, dll.).
2. **Jadwal & Presensi**:
   - `jadwal` & `pengajuan_jadwal`: Plotting shift, jadwal jaga, dan permohonan pergantian shift.
   - `absensi`: Catatan check-in/check-out harian.
   - `pengajuan_ketidakhadiran` & `pengajuan_koreksi`: Form dispensasi tidak hadir dan koreksi data presensi.
3. **Cuti & Persuratan**:
   - `pengajuan_cuti` & `data_cuti_tanggal`: Pengajuan izin cuti dan detail rentang tanggal cuti.
   - `surat_hasil_cuti`: Dokumen keputusan persetujuan/penolakan cuti.
4. **Penggajian & Keuangan**:
   - `pedoman_penggajian`: Tarif dasar per peran (gaji pokok, tunjangan shift malam, tarif lembur, potongan alpa/terlambat, % insentif).
   - `penggajian`: Rekap gaji final per periode pegawai.
   - `pengajuan_banding_gaji`: Alur komplain/banding atas ketidaksesuaian hitungan gaji.
   - `rekening_pegawai` & `transaksi_pembayaran`: Nomor rekening bank dan bukti transaksi pembayaran.
5. **Stored Procedure Khusus**:
   - `hitung_gaji_tenaga_medis`: Menghitung rincian gaji secara otomatis berdasarkan pedoman aktif, jumlah kehadiran, shift malam, lembur, serta potongan.

> 💡 **Format ID Otomatis**: Primary key menggunakan prefix sequence khusus, contohnya `PGW0000001` (Pegawai), `ABS00000001` (Absensi), `GAJI00000001` (Penggajian).

---

## 🛠️ Panduan Instalasi & Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi `>= 20.0.0`
- Akun / Proyek [Supabase](https://supabase.com/) aktif (PostgreSQL)
- Package manager `npm` (disertakan bersama Node.js) atau `pnpm`

---

### Setup Backend (`web-be`)

1. Pindah ke direktori backend:
   ```bash
   cd web-be
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Salin file environment:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan lengkapi konfigurasi Supabase Anda (lihat bagian [Environment Variables](#-konfigurasi-environment-variables)).

4. Setup Database & Prisma:
   ```bash
   # Eksekusi DDL schema & seed dummy data (opsional):
   npm run db:setup

   # Generate Prisma Client:
   npm run prisma:generate
   ```

5. Jalankan server backend:
   ```bash
   npm run dev    # Mode development (otomatis reload dengan node --watch)
   # atau
   npm start      # Mode production
   ```
   API akan berjalan di `http://localhost:5000` (atau port sesuai konfigurasi `PORT`).

---

### Setup Frontend (`web-fe`)

1. Pindah ke direktori frontend:
   ```bash
   cd web-fe
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Buat file `.env.local` jika diperlukan integrasi ke backend:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Jalankan server Next.js:
   ```bash
   npm run dev
   ```
   Aplikasi web akan tersedia di `http://localhost:3000`.

---

## ⚙️ Konfigurasi Environment Variables

### Backend (`web-be/.env`)

| Variabel | Deskripsi | Contoh Nilai |
|---|---|---|
| `NODE_ENV` | Mode lingkungan aplikasi | `development` / `production` |
| `PORT` | Port server Express | `5000` *(disarankan agar tidak tabrakan dengan FE)* |
| `CORS_ORIGIN` | Domain frontend yang diizinkan | `http://localhost:3000` |
| `SUPABASE_URL` | URL Endpoint Supabase Project | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Public Anon API Key Supabase | `eyJh...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (akses penuh backend) | `eyJh...` |
| `DATABASE_URL` | Connection string Postgres (Transaction Pooler - port 6543) | `postgresql://postgres:pass@...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Connection string Postgres direct (Session Pooler - port 5432) | `postgresql://postgres:pass@...:5432/postgres` |

> ⚠️ **Peringatan Keamanan**: Jangan pernah mempublikasikan `SUPABASE_SERVICE_ROLE_KEY` ke sisi frontend atau meng-commit file `.env` ke Git.

---

## 📜 Daftar Perintah (NPM Scripts)

### Backend (`web-be`)

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server Express dengan watch mode (`node --watch`) |
| `npm run start` | Menjalankan server Express dalam mode produksi |
| `npm run db:schema` | Menjalankan file DDL `database/schema.sql` |
| `npm run db:seed` | Mengisi database dengan data dummy `database/seed.sql` |
| `npm run db:setup` | Menjalankan `schema.sql` lalu `seed.sql` sekaligus |
| `npm run prisma:generate` | Menghasilkan kode Prisma Client dari `schema.prisma` |
| `npm run prisma:pull` | Melakukan introspeksi skema database Supabase ke Prisma |
| `npm run prisma:push` | Mendorong perubahan skema Prisma ke database tanpa file migrasi |
| `npm run prisma:studio` | Membuka antarmuka grafis (GUI) Prisma Studio di browser |

### Frontend (`web-fe`)

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server dengan Turbopack |
| `npm run build` | Membuat production build dari aplikasi Next.js |
| `npm run start` | Menjalankan server Next.js production build |
| `npm run lint` | Menjalankan ESLint untuk memeriksa kualitas kode |

---

## 📐 Konvensi Kode & Arsitektur

1. **Frontend Architecture Rules**:
   - `src/app/` hanya berfungsi untuk composition dan routing. Logika bisnis kompleks harus diletakkan pada `src/features/`.
   - Modul di `src/features/` bersifat independen dan **tidak boleh** mengimpor langsung modul feature lain.
   - Komponen, hooks, utilitas yang digunakan lebih dari satu modul harus dipindahkan ke `src/shared/`.
2. **Database & Naming Convention**:
   - Nama tabel menggunakan format `snake_case` (misal: `pengajuan_cuti`, `peran_tenaga_medis`).
   - Nama kolom tabel menggunakan `camelCase` (misal: `"idPegawai"`, `"jamMulai"`, `"totalGaji"`) agar serasi dengan format respons objek JavaScript.
   - Row Level Security (RLS) diaktifkan secara default untuk memproteksi akses langsung client tanpa autentikasi service role.

---

<div align="center">
  <b>RSI Medika</b> &copy; 2026 — Hospital Information & HRIS System
</div>
