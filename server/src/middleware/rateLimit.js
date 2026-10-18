import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Raised in the test suite, which logs in many times from one address
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});

// Stops the public contact form being used to flood the inbox
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.CONTACT_RATE_LIMIT) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You have sent several messages already, please try again later" },
});
