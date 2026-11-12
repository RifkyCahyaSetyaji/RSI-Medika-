import { Router } from 'express';

import {
  daftarGaji,
  detailGaji,
  gajiSaya,
  hitungGajiBulk,
  hitungGajiPegawai,
} from '../controllers/penggajian.controller.js';
import {
  bayarGaji,
  bayarGajiBulk,
  riwayatTransaksi,
} from '../controllers/pembayaranGaji.controller.js';
import {
  hapusRekening,
  rekeningSaya,
  tambahRekening,
} from '../controllers/rekening.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();
const pengelola = authorize(ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN);

router.use(authenticate);

// Rekening pegawai
router.get('/rekening/saya', rekeningSaya);
router.post('/rekening', tambahRekening);
router.delete('/rekening/:idRekening', hapusRekening);

// Riwayat transaksi pembayaran
router.get('/transaksi/riwayat', riwayatTransaksi);

// Slip gaji milik sendiri
router.get('/saya', gajiSaya);

// Kelola & hitung gaji (HRD & Manajemen Keuangan)
router.get('/', pengelola, daftarGaji);
router.post('/hitung', pengelola, hitungGajiPegawai);
router.post('/hitung-bulk', pengelola, hitungGajiBulk);

// Pencairan / pembayaran gaji (Manajemen Keuangan & HRD)
router.post('/bayar-bulk', pengelola, bayarGajiBulk);
router.post('/:idGaji/bayar', pengelola, bayarGaji);

// Detail 1 slip gaji (pemilik, HRD, Manajemen Keuangan)
router.get('/:idGaji', detailGaji);

export default router;
