import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket & {
    service_providers?: { shop_name: string; city: string | null } | null;
  };
  size?: "compact" | "full";
  href?: string;
  portal?: "customer" | "provider" | "admin";
}

export function TicketCard({
  ticket,
  size = "compact",
  href,
  portal = "customer",
}: TicketCardProps) {
  const defaultHref =
    portal === "customer"
      ? `/customer/tickets/${ticket.id}`
      : portal === "provider"
        ? `/provider/jobs/${ticket.id}`
        : `/admin/tickets/${ticket.id}`;

  const cardContent = (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all",
        size === "compact" ? "p-4" : "p-6",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">
              {ticket.ticket_number}
            </span>
            <StatusBadge type="ticket" status={ticket.status} />
          </div>
          <p className="font-medium text-gray-900 truncate">
            {ticket.device_type} {ticket.brand && `— ${ticket.brand}`}{" "}
            {ticket.model && ticket.model}
          </p>
          {size === "full" && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {ticket.issue_description}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500">
            {formatDate(ticket.updated_at)}
          </p>
          {ticket.service_providers && (
            <p className="text-xs text-gray-600 mt-1">
              {ticket.service_providers.shop_name}
            </p>
          )}
        </div>
      </div>
      {size === "full" && (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="capitalize">{ticket.service_mode}</span>
          <span>•</span>
          <span className="capitalize">{ticket.urgency}</span>
          {ticket.preferred_date && (
            <>
              <span>•</span>
              <span>Preferred: {formatDate(ticket.preferred_date)}</span>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Link href={href ?? defaultHref} className="block">
      {cardContent}
    </Link>
  );
}
