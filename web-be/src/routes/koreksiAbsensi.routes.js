import { Router } from 'express';

import {
  ajukanKoreksi,
  batalkanKoreksi,
  daftarKoreksi,
  koreksiSaya,
  setujuiKoreksi,
  tolakKoreksi,
} from '../controllers/koreksiAbsensi.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate);

// Pegawai
router.post('/', ajukanKoreksi);
router.get('/saya', koreksiSaya);
router.patch('/:idKoreksi/batal', batalkanKoreksi);

// Sekretaris Unit memproses; HRD hanya bisa melihat
router.get('/', authorize(ROLES.SEKRETARIS_UNIT, ROLES.HRD), daftarKoreksi);
router.patch('/:idKoreksi/setujui', authorize(ROLES.SEKRETARIS_UNIT), setujuiKoreksi);
router.patch('/:idKoreksi/tolak', authorize(ROLES.SEKRETARIS_UNIT), tolakKoreksi);

export default router;

