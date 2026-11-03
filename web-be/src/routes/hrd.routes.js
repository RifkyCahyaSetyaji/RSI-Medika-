import { Router } from 'express';

import {
  buatAkun,
  daftarPeran,
  pegawaiTanpaAkun,
  tambahPeran,
  ubahPeranPegawai,
} from '../controllers/hrd.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.HRD));

router.get('/pegawai-tanpa-akun', pegawaiTanpaAkun);
router.post('/akun', buatAkun);

router.get('/peran', daftarPeran);
router.post('/peran', tambahPeran);
router.patch('/pegawai/:idPegawai/peran', ubahPeranPegawai);

export default router;

