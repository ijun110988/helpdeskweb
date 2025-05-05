import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Semua routes membutuhkan autentikasi
router.use(authMiddleware);

router.get('/', getProfile as any);
router.put('/', updateProfile as any);

export default router;
