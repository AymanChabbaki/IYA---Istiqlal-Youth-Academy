import { Router } from 'express';
import { register, login, refresh, logout, forgotPassword, resetPassword, validateResetToken } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/validate-reset-token', validateResetToken);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
