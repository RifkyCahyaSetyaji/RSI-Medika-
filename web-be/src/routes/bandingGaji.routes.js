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
const pengelola = authorize(ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN);

router.use(authenticate);

// Pegawai
router.post('/', ajukanBanding);
router.get('/saya', bandingSaya);
router.patch('/:idPengajuan/batal', batalkanBanding);

// HRD & Manajemen Keuangan
router.get('/', pengelola, daftarBanding);
router.get('/:idPengajuan', detailBanding);
router.patch('/:idPengajuan/proses', pengelola, prosesBanding);

export default router;

