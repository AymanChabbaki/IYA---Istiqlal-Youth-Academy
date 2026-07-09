import rateLimit from 'express-rate-limit';

// ─── Auth: login/register/forgot-password/reset-password ── brute-force & credential-stuffing defense ──
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes before trying again.' },
});

// ─── Public forms: contact / guest event registration ── spam & mailbox-flood defense ──
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait a few minutes before trying again.' },
});

// ─── Expensive AI generation endpoints (Gemini image gen) ── cost & quota-exhaustion defense ──
export const aiGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many generation requests. Please try again later.' },
});
