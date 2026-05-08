import { cn } from '@/lib/utils'
import type { TicketStatus, DeliveryStatus, QuoteStatus } from '@/types'
import {
  TICKET_STATUS_LABELS, TICKET_STATUS_COLORS,
  DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS,
  QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS,
} from '@/types'

type StatusBadgeProps =
  | { type: 'ticket'; status: TicketStatus }
  | { type: 'delivery'; status: DeliveryStatus }
  | { type: 'quote'; status: QuoteStatus }

export function StatusBadge(props: StatusBadgeProps) {
  let label: string
  let colorClass: string

  if (props.type === 'ticket') {
    label = TICKET_STATUS_LABELS[props.status]
    colorClass = TICKET_STATUS_COLORS[props.status]
  } else if (props.type === 'delivery') {
    label = DELIVERY_STATUS_LABELS[props.status]
    colorClass = DELIVERY_STATUS_COLORS[props.status]
  } else {
    label = QUOTE_STATUS_LABELS[props.status]
    colorClass = QUOTE_STATUS_COLORS[props.status]
  }

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colorClass)}>
      {label}
    </span>
  )
}
