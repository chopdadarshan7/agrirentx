import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Pick a rating.").max(5),
  review: z.string().trim().max(1000, "Keep it under 1000 characters.").optional().default(""),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
