import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  pnum: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

export const addToCartSchema = z.object({
  pid: z.coerce.number().int().positive(),
  count: z.coerce.number().int().min(1).max(10),
});

export const buyItemSchema = z.object({
  pid: z.array(z.coerce.number().int().positive()).min(1),
});
