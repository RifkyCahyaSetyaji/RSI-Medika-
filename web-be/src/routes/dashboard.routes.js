import { Router } from 'express';
import {
  getDashboardSummary,
  getHrdDashboard,
  getKeuanganDashboard,
  getSekretarisDashboard,
  getTenagaMedisDashboard,
} from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate);

// Endpoint ringkasan otomatis sesuai role yang sedang login
router.get('/summary', getDashboardSummary);

// Endpoint khusus masing-masing role dengan proteksi RBAC
router.get('/hrd', authorize(ROLES.HRD, ROLES.SUPER_ADMIN), getHrdDashboard);
router.get(
  '/keuangan',
  authorize(ROLES.MANAJEMEN_KEUANGAN, ROLES.SUPER_ADMIN),
  getKeuanganDashboard,
);
router.get(
  '/sekretaris',
  authorize(ROLES.SEKRETARIS_UNIT, ROLES.SUPER_ADMIN),
  getSekretarisDashboard,
);
router.get(
  '/tenaga-medis',
  authorize(ROLES.TENAGA_MEDIS, ROLES.SUPER_ADMIN),
  getTenagaMedisDashboard,
);

export default router;
