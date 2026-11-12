import { Router } from 'express';

import {
  absenMasuk,
  absenPulang,
  detailRiwayat,
  rekapAbsensi,
  riwayatSaya,
  statusAbsen,
} from '../controllers/absensi.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate);

router.get('/status', statusAbsen);
router.post('/masuk', absenMasuk);
router.post('/pulang', absenPulang);
router.get('/riwayat', riwayatSaya);
router.get('/riwayat/:idJadwal', detailRiwayat);

router.get('/rekap', authorize(ROLES.HRD, ROLES.SEKRETARIS_UNIT), rekapAbsensi);

export default router;

