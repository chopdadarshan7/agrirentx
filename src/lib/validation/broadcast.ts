import { z } from "zod";

export const broadcastSchema = z.object({
  title: z.string().trim().min(3, "Enter a title."),
  message: z.string().trim().min(5, "Enter a message."),
  audience: z.enum(["all", "farmers", "rentalers"]),
});

export type BroadcastFormValues = z.infer<typeof broadcastSchema>;
