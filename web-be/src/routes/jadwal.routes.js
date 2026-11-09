import { Router } from 'express';

import {
  buatJadwal,
  buatJadwalBulk,
  daftarJadwal,
  daftarShift,
  hapusJadwal,
  jadwalSaya,
  ubahJadwal,
} from '../controllers/jadwal.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();
const pengelola = authorize(ROLES.HRD, ROLES.SEKRETARIS_UNIT);

router.use(authenticate);

router.get('/shift', daftarShift);
router.get('/saya', jadwalSaya);

router.get('/', pengelola, daftarJadwal);
router.post('/', pengelola, buatJadwal);
router.post('/bulk', pengelola, buatJadwalBulk);
router.patch('/:idJadwal', pengelola, ubahJadwal);
router.delete('/:idJadwal', pengelola, hapusJadwal);

export default router;

