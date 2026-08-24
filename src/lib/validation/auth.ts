import { z } from "zod";

// Mirrors agrirentx-backend/validators/authValidator.js exactly. No role field, ever.
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Enter your full name.").max(100),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
    password: z.string().min(6, "Use at least 6 characters.").max(30),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
