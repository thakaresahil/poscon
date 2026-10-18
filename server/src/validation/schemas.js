import { z } from "zod";
import { isExpiryInFuture, isValidCardNumber } from "../utils/mockPayment.js";

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

const cardSchema = z.object({
  number: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .refine(isValidCardNumber, "Please enter a valid card number"),
  name: z.string().trim().min(2, "Please enter the name on the card").max(100),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format")
    .refine((value) => isExpiryInFuture(value), "This card has expired"),
  cvv: z.string().trim().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export const paymentSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("card"), card: cardSchema }),
  z.object({
    method: z.literal("upi"),
    upiId: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9._-]{2,}@[a-z]{2,}$/, "Please enter a valid UPI ID, like name@bank"),
  }),
  z.object({ method: z.literal("cod") }),
], {
  errorMap: (issue, ctx) =>
    issue.code === "invalid_union_discriminator"
      ? { message: "Please choose a payment method" }
      : { message: ctx.defaultError },
});
