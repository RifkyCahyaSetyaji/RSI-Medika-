import { Router } from 'express';

import {
  buatPedoman,
  daftarPedoman,
  detailPedoman,
  hapusPedoman,
  ubahPedoman,
} from '../controllers/pedomanGaji.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();
const pengelola = authorize(ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN);

router.use(authenticate);

// Semua pegawai bisa melihat daftar pedoman; HRD & Keuangan bisa mengelola
router.get('/', daftarPedoman);
router.get('/:idPedoman', detailPedoman);
router.post('/', pengelola, buatPedoman);
router.patch('/:idPedoman', pengelola, ubahPedoman);
router.delete('/:idPedoman', pengelola, hapusPedoman);

export default router;

