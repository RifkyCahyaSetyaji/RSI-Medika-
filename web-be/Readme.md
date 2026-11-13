# RSI Medika — Backend (web-be)

REST API untuk RSI Medika, dibangun dengan **Node.js + Express** dan **Supabase (PostgreSQL)**.

## Struktur Folder

```
web-be/
├── src/
│   ├── config/         # env & Supabase client
│   ├── controllers/    # logic tiap endpoint
│   ├── middlewares/    # error handler, auth, dll
│   ├── routes/         # definisi route
│   ├── utils/          # helper (ApiError, asyncHandler)
│   ├── app.js          # setup Express
│   └── server.js       # entry point
├── .env.example
└── package.json
```

## Setup

1. Install dependency:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env`, lalu isi kredensial dari Supabase
   (**Project Settings → API**):
   ```bash
   cp .env.example .env
   ```
3. Jalankan server:
   ```bash
   npm run dev   # mode development (auto-reload)
   npm start     # mode production
   ```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` mem-bypass Row Level Security. Hanya dipakai di backend, jangan pernah dikirim ke frontend / di-commit.

## Database

Skema ada di folder `database/`:

| File         | Isi                                                        |
| ------------ | ---------------------------------------------------------- |
| `schema.sql` | 15 tabel + FK, constraint, index, RLS, generator ID        |
| `seed.sql`   | Data contoh (opsional, untuk testing)                      |

Cara menjalankan:
- Menggunakan skrip SQL langsung: `npm run db:schema` (opsional `npm run db:seed`)
- Menggunakan Prisma ORM: `npm run prisma:push` atau `npm run prisma:pull`

### Prisma ORM Commands

```bash
npm run prisma:generate  # Generate Prisma Client
npm run prisma:pull      # Introspeksi skema dari database Supabase
npm run prisma:push      # Push perubahan schema.prisma ke database
npm run prisma:studio    # Buka Prisma Studio GUI di browser
```

Client Prisma siap diimpor dari `src/config/prisma.js`:
```js
import { prisma } from '../config/prisma.js';

const listPegawai = await prisma.pegawai.findMany();
```


Catatan:
- Nama tabel `snake_case` (mis. `pengajuan_cuti`), nama kolom `camelCase` sesuai kamus data (mis. `idPegawai`).
  Di supabase-js langsung pakai: `.from('pegawai').select('idPegawai, nama')`. Di SQL mentah kolom harus di-quote: `"idPegawai"`.
- ID otomatis dibuat jika tidak diisi (mis. `PGW0000002`, `CUTI00000002`).
- RLS aktif tanpa policy → tabel hanya bisa diakses lewat backend (service role key).

### Peran Tenaga Medis & Pedoman Penggajian

- `peran_tenaga_medis`: master peran (Dokter Umum, Dokter Spesialis, Dokter Gigi, Perawat, Bidan, Apoteker,
  Analis Laboratorium, Radiografer, Fisioterapis, Ahli Gizi). Pegawai medis ditautkan lewat `pegawai.idPeran`
  (NULL untuk non-medis). `akun.role` tetap kategori umum (mis. `Tenaga Medis`).
- `pedoman_penggajian`: tarif per peran + masa berlaku (`berlakuMulai`/`berlakuSampai`), berisi gaji pokok,
  tunjangan jabatan, tunjangan shift malam, lembur/jam, kehadiran/hari, % insentif jasa medis,
  potongan alpa/hari, potongan terlambat/kejadian. Template pengisian ada di `seed.sql`.
- Fungsi `hitung_gaji_tenaga_medis` menghitung rincian gaji dari pedoman yang berlaku:

  ```js
  const { data, error } = await getSupabase().rpc('hitung_gaji_tenaga_medis', {
    p_id_pegawai: 'PGW0000001', p_periode: '2026-10',
    p_jumlah_shift_malam: 6, p_jam_lembur: 10, p_hari_hadir: 22,
    p_nilai_jasa_medis: 0, p_hari_alpa: 0, p_jumlah_terlambat: 1,
  });
  // data[0] -> { gajiPokok, tunjangan, potongan, totalGaji, idPedoman, ...rincian }
  ```

  Hasilnya disimpan ke tabel `penggajian` (termasuk `idPedoman`).

### Endpoint publik

| Method | Path              | Keterangan                 |
| ------ | ----------------- | -------------------------- |
| GET    | `/`               | Welcome message            |
| GET    | `/api/health`     | Status server              |
| GET    | `/api/health/db`  | Cek koneksi ke Supabase    |

## Menambah Modul Baru

Contoh modul `pasien`:

```js
// src/controllers/pasien.controller.js
import { getSupabase } from '../config/supabase.js';
import { asyncHandler, ApiError } from '../utils/http.js';

export const listPasien = asyncHandler(async (req, res) => {
  const { data, error } = await getSupabase().from('pasien').select('*');
  if (error) throw new ApiError(500, error.message);
  res.json({ success: true, data });
});
```

```js
// src/routes/pasien.routes.js
import { Router } from 'express';
import { listPasien } from '../controllers/pasien.controller.js';

const router = Router();
router.get('/', listPasien);
export default router;
```

Lalu daftarkan di `src/routes/index.js`:

```js
router.use('/pasien', pasienRoutes);
```
