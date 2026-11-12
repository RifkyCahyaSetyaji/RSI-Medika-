# 🩺 RSI Medika — Frontend (`web-fe`)

Aplikasi antarmuka web (frontend) untuk Sistem Manajemen & HRIS **RSI Medika**, dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.

---

## 🏛️ Arsitektur Folder (`src/`)

Frontend menerapkan *Feature-Driven Architecture* untuk menjaga skalabilitas dan keteraturan kode:

```
src/
├── app/                 # Next.js App Router (Hanya routing & layout composition)
│   ├── (dashboard)/     # Rute terproteksi dashboard per peran:
│   │   ├── hrd/         # Halaman manajemen SDM, absensi, gaji, pedoman
│   │   ├── keuangan/    # Halaman payroll, pedoman tarif, aju banding
│   │   ├── sekretaris/  # Halaman kelola jadwal shift & presensi unit
│   │   └── tenaga-medis/# Halaman jadwal pribadi, absensi, rincian slip gaji
│   ├── (public)/        # Rute publik (login, dll.)
│   ├── layout.tsx       # Root layout & providers
│   └── globals.css      # Styling Tailwind CSS v4
│
├── features/            # Modul domain bisnis mandiri (Feature-driven)
│   ├── auth/            # Otentikasi & session context
│   ├── dashboard/       # Statistik & widget ringkasan
│   ├── dokter/          # Domain fungsional dokter
│   ├── farmasi/         # Domain farmasi & obat
│   ├── janji-temu/      # Penjadwalan konsultasi & janji temu
│   ├── pasien/          # Manajemen data pasien
│   └── rekam-medis/     # Rekam medis elektronik
│
├── shared/              # Komponen & utilitas yang dapat digunakan ulang lintas domain
│   ├── components/      # UI primitives & komponen layout (Sidebar, Header, Breadcrumb)
│   ├── hooks/           # Custom React hooks bersama
│   ├── lib/             # Helper fungsi (formatters, styling helpers)
│   ├── providers/       # Context Providers (AuthProvider, dll.)
│   ├── services/        # Service API client
│   └── types/           # Definisi tipe TypeScript global & peran pengguna
└── assets/              # Aset statis (font, ikon, gambar khusus)
```

---

## 📐 Aturan Pengembangan (Hard Rules)

Sesuai dokumen arsitektur di `docs/architecture.md`:
1. **Composition Only**: Direktori `src/app/` hanya bertanggung jawab terhadap rute, meta tags, dan komposisi kontainer feature.
2. **Feature Isolation**: Modul dalam `src/features/<feature>/` **tidak boleh** mengimpor langsung dari feature lain.
3. **Shared Abstraction**: Komponen, hooks, atau utilitas yang dipakai lebih dari satu domain wajib diletakkan di `src/shared/`.
4. **Shared Independence**: Kode di dalam `src/shared/` **tidak boleh** mengimpor apa pun dari dalam `src/features/`.

---

## 🚀 Memulai Pengembangan

1. Pastikan dependensi telah terinstal:
   ```bash
   npm install
   ```

2. Buat konfigurasi `.env.local` jika diperlukan integrasi ke backend API:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Jalankan server pengembangan (Turbopack):
   ```bash
   npm run dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📜 Perintah Tersedia

- `npm run dev` — Menjalankan dev server Next.js dengan Turbopack.
- `npm run build` — Membuat build produksi aplikasi.
- `npm run start` — Menjalankan build produksi di server lokal.
- `npm run lint` — Menjalankan ESLint untuk memeriksa kualitas kode.

---

Untuk dokumentasi lengkap ekosistem RSI Medika, silakan lihat [README Utama Proyek](../Readme.md).
