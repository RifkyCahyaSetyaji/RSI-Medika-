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

router.use(authenticate);

const hrdOnly = authorize(ROLES.HRD, ROLES.SUPER_ADMIN);
const hrdOrSekretaris = authorize(
  ROLES.HRD,
  ROLES.SEKRETARIS_UNIT,
  ROLES.MANAJEMEN_KEUANGAN,
  ROLES.SUPER_ADMIN
);

// Manajemen Akun & Pegawai Tanpa Akun
router.get('/pegawai-tanpa-akun', hrdOnly, pegawaiTanpaAkun);
router.post('/akun', hrdOnly, buatAkun);

// Master Data Pegawai
router.get('/pegawai', hrdOrSekretaris, daftarPegawai);
router.post('/pegawai', hrdOnly, tambahPegawai);
router.get('/pegawai/:idPegawai', hrdOrSekretaris, detailPegawai);
router.patch('/pegawai/:idPegawai', hrdOnly, ubahPegawai);
router.delete('/pegawai/:idPegawai', hrdOnly, hapusPegawai);

// Master Peran Tenaga Medis
router.get('/peran', hrdOrSekretaris, daftarPeran);
router.post('/peran', hrdOnly, tambahPeran);
router.patch('/pegawai/:idPegawai/peran', hrdOnly, ubahPeranPegawai);

export default router;
