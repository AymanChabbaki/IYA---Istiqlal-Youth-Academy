import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { sendChatMessage } from '../controllers/chat.controller';

const router = Router();

// 20 messages per 5 minutes per IP — generous for real use, cheap to defend against abuse
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please wait a moment before trying again.' },
});

router.post('/', chatLimiter, sendChatMessage);

export default router;
