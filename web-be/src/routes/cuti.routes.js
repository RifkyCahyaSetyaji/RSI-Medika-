import { Router } from 'express';

import {
  ajukanCuti,
  batalkanCuti,
  cutiSaya,
  daftarCuti,
  detailCuti,
  jenisCuti,
  notifikasiSaya,
  setujuiCuti,
  tolakCuti,
} from '../controllers/cuti.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate);

// Pegawai
router.get('/jenis', jenisCuti);
router.get('/notifikasi', notifikasiSaya);
router.post('/', ajukanCuti);
router.get('/saya', cutiSaya);
router.patch('/:idPengajuan/batal', batalkanCuti);

// Sekretaris Unit memproses; HRD hanya bisa melihat
router.get('/', authorize(ROLES.SEKRETARIS_UNIT, ROLES.HRD), daftarCuti);
router.get('/:idPengajuan', detailCuti);
router.patch('/:idPengajuan/setujui', authorize(ROLES.SEKRETARIS_UNIT), setujuiCuti);
router.patch('/:idPengajuan/tolak', authorize(ROLES.SEKRETARIS_UNIT), tolakCuti);

export default router;
