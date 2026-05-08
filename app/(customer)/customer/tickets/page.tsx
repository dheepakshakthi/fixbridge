"use client";

import { useState } from "react";
import Link from "next/link";
import { useCustomerTickets } from "@/hooks/useTickets";
import { TicketCard } from "@/components/ui/TicketCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TicketCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Plus, Inbox } from "lucide-react";
import type { TicketStatus } from "@/types";
import { DEVICE_TYPES, TICKET_STATUS_LABELS } from "@/types";

const ALL_STATUSES: TicketStatus[] = [
  "draft",
  "submitted",
  "quoted",
  "accepted",
  "in_repair",
  "ready",
  "completed",
  "cancelled",
  "disputed",
];

export default function MyTickets() {
  const [status, setStatus] = useState<TicketStatus | undefined>();
  const [deviceType, setDeviceType] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomerTickets({
    status,
    device_type: deviceType,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        <Link href="/customer/tickets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <select
          value={status ?? ""}
          onChange={(e) => {
            setStatus((e.target.value as TicketStatus) || undefined);
            setPage(1);
          }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {TICKET_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={deviceType ?? ""}
          onChange={(e) => {
            setDeviceType(e.target.value || undefined);
            setPage(1);
          }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Devices</option>
          {DEVICE_TYPES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {(status || deviceType) && (
          <button
            onClick={() => {
              setStatus(undefined);
              setDeviceType(undefined);
              setPage(1);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No tickets found"
          description={
            status || deviceType
              ? "No tickets match your current filters. Try adjusting them."
              : "You haven't raised any repair requests yet. Get started now!"
          }
          action={{
            label: "Raise a Request",
            onClick: () => (window.location.href = "/customer/tickets/new"),
          }}
        />
      ) : (
        <div className="space-y-3">
          {data?.data.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              portal="customer"
              size="full"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.count > 20 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="py-2 px-3 text-sm text-gray-500">
            Page {page} of {Math.ceil(data.count / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(data.count / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
