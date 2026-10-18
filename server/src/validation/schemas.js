import { z } from "zod";

const quantityMessage = "Quantity must be between 1 and 10";

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
  count: z.coerce.number().int().min(1, quantityMessage).max(10, quantityMessage),
});

export const updateCartSchema = z.object({
  quantity: z.coerce.number().int().min(1, quantityMessage).max(10, quantityMessage),
});

export const shippingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  address: z.string().trim().min(5, "Please enter your full address").max(255),
  city: z.string().trim().min(2, "Please enter your city").max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});
