import { rateLimit } from "express-rate-limit";

export const perMinuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    limitType: "minute",
    message:
      "You're sending messages too fast. Please wait a moment and try again.",
  },
});

export const perDayLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    limitType: "day",
    message:
      "You've reached today's message limit for your connection. Please try again tomorrow.",
  },
});
