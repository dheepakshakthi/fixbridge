import { z } from "zod";

const DEVICE_CATEGORIES = ["PC", "Laptop", "Console", "Mobile"] as const;

const dayHoursSchema = z.object({
  is_open: z.boolean(),
  open_time: z.string(),
  close_time: z.string(),
});

export const providerOnboardingSchema = z.object({
  shop_name: z
    .string()
    .min(3, "Shop name must be at least 3 characters")
    .max(100, "Shop name is too long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description is too long"),
  device_categories: z
    .array(z.enum(DEVICE_CATEGORIES))
    .min(1, "Select at least one device category"),
  services_offered: z.array(z.string()).optional().default([]),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  working_hours: z.object({
    monday: dayHoursSchema,
    tuesday: dayHoursSchema,
    wednesday: dayHoursSchema,
    thursday: dayHoursSchema,
    friday: dayHoursSchema,
    saturday: dayHoursSchema,
    sunday: dayHoursSchema,
  }),
});

export type ProviderOnboardingInput = z.infer<typeof providerOnboardingSchema>;
