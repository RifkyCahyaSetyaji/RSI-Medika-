import { Router } from 'express';

import { buatAkunHrd, daftarAkunHrd } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

router.get('/akun-hrd', daftarAkunHrd);
router.post('/akun-hrd', buatAkunHrd);

export default router;

