import { Router } from 'express';

import {
  ajukan,
  batalkan,
  daftarPengajuan,
  pengajuanSaya,
  setujui,
  tolak,
} from '../controllers/pengajuanJadwal.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate);

// Pegawai (semua yang punya jadwal)
router.post('/', ajukan);
router.get('/saya', pengajuanSaya);
router.patch('/:idPengajuan/batal', batalkan);

// Sekretaris Unit memproses; HRD hanya bisa melihat
router.get('/', authorize(ROLES.SEKRETARIS_UNIT, ROLES.HRD), daftarPengajuan);
router.patch('/:idPengajuan/setujui', authorize(ROLES.SEKRETARIS_UNIT), setujui);
router.patch('/:idPengajuan/tolak', authorize(ROLES.SEKRETARIS_UNIT), tolak);

export default router;

