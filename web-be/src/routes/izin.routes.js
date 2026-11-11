import { Router } from 'express';

import {
  ajukanIzin,
  batalkanIzin,
  daftarIzin,
  izinSaya,
  jenisIzin,
  setujuiIzin,
  tolakIzin,
} from '../controllers/izin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate);

// Pegawai
router.get('/jenis', jenisIzin);
router.post('/', ajukanIzin);
router.get('/saya', izinSaya);
router.patch('/:idPengajuan/batal', batalkanIzin);

// Sekretaris Unit memproses; HRD hanya bisa melihat
router.get('/', authorize(ROLES.SEKRETARIS_UNIT, ROLES.HRD), daftarIzin);
router.patch('/:idPengajuan/setujui', authorize(ROLES.SEKRETARIS_UNIT), setujuiIzin);
router.patch('/:idPengajuan/tolak', authorize(ROLES.SEKRETARIS_UNIT), tolakIzin);

export default router;

