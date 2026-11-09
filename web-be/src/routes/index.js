import { Router } from 'express';
import { getHealth, getDbHealth } from '../controllers/health.controller.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import hrdRoutes from './hrd.routes.js';
import jadwalRoutes from './jadwal.routes.js';
import pengajuanJadwalRoutes from './pengajuanJadwal.routes.js';

const router = Router();

router.get('/health', getHealth);
router.get('/health/db', getDbHealth);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/hrd', hrdRoutes);
router.use('/jadwal', jadwalRoutes);
router.use('/pengajuan-jadwal', pengajuanJadwalRoutes);

// Daftarkan route modul lain di sini, contoh:
// router.use('/pasien', pasienRoutes);

export default router;
