import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  comment: z.string().max(500, 'Comment must be under 500 characters').optional(),
})

export type ReviewInput = z.infer<typeof reviewSchema>
