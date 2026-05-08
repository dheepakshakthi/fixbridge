import { z } from 'zod'

export const disputeSchema = z.object({
  reason: z.string()
    .min(20, 'Please provide at least 20 characters explaining the dispute')
    .max(1000, 'Reason must be under 1000 characters'),
})

export type DisputeInput = z.infer<typeof disputeSchema>
