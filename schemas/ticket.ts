import { z } from "zod";

const DEVICE_TYPES = ["PC", "Laptop", "Console", "Mobile"] as const;
const SERVICE_MODES = ["dropoff", "pickup", "delivery"] as const;
const URGENCY_LEVELS = ["urgent", "standard", "flexible"] as const;

// Step 1 — Device details
export const ticketStep1Schema = z.object({
  device_type: z.enum(DEVICE_TYPES, {
    error: (issue) =>
      issue.input === undefined ? "Please select a device type" : undefined,
  }),
  brand: z.string().optional(),
  model: z.string().optional(),
});

// Step 2 — Issue description
export const ticketStep2Schema = z.object({
  issue_description: z
    .string()
    .min(30, "Please describe the issue in at least 30 characters")
    .max(1000, "Description must be under 1000 characters"),
  issue_images: z
    .array(z.string().url())
    .max(5, "Maximum 5 images allowed")
    .optional(),
});

// Step 3 — Service preferences
export const ticketStep3BaseSchema = z.object({
  service_mode: z.enum(SERVICE_MODES, {
    error: (issue) =>
      issue.input === undefined ? "Please select a service mode" : undefined,
  }),
  customer_address: z
    .object({
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    })
    .optional(),
  urgency: z.enum(URGENCY_LEVELS, {
    error: (issue) =>
      issue.input === undefined ? "Please select urgency" : undefined,
  }),
  preferred_date: z
    .string()
    .refine(
      (date) => !date || new Date(date) > new Date(),
      "Preferred date must be in the future",
    )
    .optional(),
});

const ticketStep3Refinement = (data: any, ctx: z.RefinementCtx) => {
  if (
    (data.service_mode === "pickup" || data.service_mode === "delivery") &&
    !data.customer_address
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Address is required for pickup/delivery",
      path: ["customer_address"],
    });
  }
};

export const ticketStep3Schema = ticketStep3BaseSchema.superRefine(
  ticketStep3Refinement,
);

// Step 4 — Provider selection
export const ticketStep4Schema = z.object({
  provider_id: z.string().uuid().optional(),
});

// Combined full schema
export const createTicketSchema = ticketStep1Schema
  .merge(ticketStep2Schema)
  .merge(ticketStep3BaseSchema)
  .merge(ticketStep4Schema)
  .superRefine(ticketStep3Refinement);

export type TicketStep1 = z.infer<typeof ticketStep1Schema>;
export type TicketStep2 = z.infer<typeof ticketStep2Schema>;
export type TicketStep3 = z.infer<typeof ticketStep3Schema>;
export type TicketStep4 = z.infer<typeof ticketStep4Schema>;
