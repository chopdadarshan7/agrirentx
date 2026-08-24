import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name."),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
