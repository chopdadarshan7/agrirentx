import { z } from "zod";

export const kycSchema = z.object({
  account_holder: z.string().trim().min(2, "Enter the account holder's name."),
  account_number: z.string().trim().regex(/^\d{9,18}$/, "Enter a valid account number (9-18 digits)."),
  ifsc_code: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code."),
  bank_name: z.string().trim().min(2, "Enter the bank name."),
});

export type KycFormValues = z.infer<typeof kycSchema>;
