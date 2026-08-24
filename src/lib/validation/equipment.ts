import { z } from "zod";

export const equipmentSchema = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(100),
  category_id: z.string().min(1, "Select a category."),
  description: z.string().trim().min(20, "Add a bit more detail (min 20 characters).").max(2000),
  price_per_day: z.coerce.number().min(1, "Enter a daily rate."),
  security_deposit: z.coerce.number().min(0),
  location: z.object({
    address: z.string().trim().min(1, "Address is required."),
    village: z.string().trim().optional(),
    taluka: z.string().trim().optional(),
    district: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
  specs: z.array(z.object({ label: z.string(), value: z.string() })),
  images: z.array(z.instanceof(File)).max(10, "Up to 10 images."),
});

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
