import { Router } from 'express';

import { gantiPassword, login, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/ganti-password', authenticate, gantiPassword);

export default router;
