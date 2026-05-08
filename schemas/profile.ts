import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[+]?[\d\s\-()]{10,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
