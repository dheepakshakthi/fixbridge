import { z } from "zod";

export const resolveDisputeSchema = z.object({
  resolution: z.enum(["favour_customer", "favour_provider", "escalate"]),
  resolution_notes: z
    .string()
    .min(10, "Please provide at least 10 characters of resolution notes"),
});

export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
