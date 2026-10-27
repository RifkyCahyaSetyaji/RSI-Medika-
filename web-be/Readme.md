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

## Endpoint

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
