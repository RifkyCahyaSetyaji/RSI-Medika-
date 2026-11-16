import { Router } from 'express';

import { buatAkun, pegawaiTanpaAkun } from '../controllers/akun.controller.js';
import { daftarPeran, tambahPeran, ubahPeranPegawai } from '../controllers/peran.controller.js';
import {
  daftarPegawai,
  detailPegawai,
  tambahPegawai,
  ubahPegawai,
  hapusPegawai,
} from '../controllers/pegawai.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.HRD));

// Manajemen Akun & Pegawai Tanpa Akun
router.get('/pegawai-tanpa-akun', pegawaiTanpaAkun);
router.post('/akun', buatAkun);

// Master Data Pegawai
router.get('/pegawai', daftarPegawai);
router.post('/pegawai', tambahPegawai);
router.get('/pegawai/:idPegawai', detailPegawai);
router.patch('/pegawai/:idPegawai', ubahPegawai);
router.delete('/pegawai/:idPegawai', hapusPegawai);

// Master Peran Tenaga Medis
router.get('/peran', daftarPeran);
router.post('/peran', tambahPeran);
router.patch('/pegawai/:idPegawai/peran', ubahPeranPegawai);

export default router;
