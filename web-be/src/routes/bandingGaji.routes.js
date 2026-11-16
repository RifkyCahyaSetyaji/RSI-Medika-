import { Router } from 'express';

import {
  ajukanBanding,
  bandingSaya,
  batalkanBanding,
  daftarBanding,
  detailBanding,
  prosesBanding,
} from '../controllers/bandingGaji.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate);

// Pegawai
router.post('/', ajukanBanding);
router.get('/saya', bandingSaya);
router.patch('/:idPengajuan/batal', batalkanBanding);

// Daftar & Detail: HRD dan Manajemen Keuangan (pemantauan)
router.get('/', authorize(ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN), daftarBanding);
router.get('/:idPengajuan', detailBanding);

// Verifikasi & Pengesahan Banding: HANYA HRD (bukan Manajemen Keuangan)
router.patch('/:idPengajuan/proses', authorize(ROLES.HRD), prosesBanding);

export default router;

