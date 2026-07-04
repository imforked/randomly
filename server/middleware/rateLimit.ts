import rateLimit from "express-rate-limit";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too many requests." },
});

export const createRoomRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "too many rooms created." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createUserRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { error: "too many join attempts." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createOptionsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { error: "too many option submissions." },
  standardHeaders: true,
  legacyHeaders: false,
});
