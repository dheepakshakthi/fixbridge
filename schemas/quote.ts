import { z } from 'zod'

export const quoteLineItemSchema = z.object({
  label: z.string().min(2, 'Label must be at least 2 characters'),
  amount: z.number().positive('Amount must be positive'),
})

export const submitQuoteSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(99999.99, 'Amount is too large'),
  currency: z.string().default('INR'),
  line_items: z.array(quoteLineItemSchema)
    .min(1, 'At least one line item is required')
    .max(20, 'Maximum 20 line items'),
  estimated_days: z.number()
    .int('Must be a whole number')
    .min(1, 'Minimum 1 day')
    .max(90, 'Maximum 90 days'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
  valid_until: z.string().refine(
    (date) => new Date(date) > new Date(Date.now() + 24 * 60 * 60 * 1000),
    'Valid until must be at least 24 hours in the future'
  ),
})

export type SubmitQuoteInput = z.infer<typeof submitQuoteSchema>
