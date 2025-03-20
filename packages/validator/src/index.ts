import z from 'zod';

export const userSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(20, { message: "Name must be at most 20 characters" }),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(30, { message: "Password must be at most 30 characters" }),
});

export const verifySchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  otp: z.string().length(6, { message: "Verification code must be 6 characters long" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(30, { message: "Password must be at most 30 characters" }),
});

