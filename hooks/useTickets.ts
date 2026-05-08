"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type {
  TicketStatus,
  CreateTicketInput,
  Ticket,
  TicketEvent,
  Quote,
  Delivery,
  Profile,
  ServiceMode,
  UrgencyLevel,
  TicketInsert,
  TicketUpdate,
} from "@/types";

export function useCustomerTickets(filters?: {
  status?: TicketStatus;
  device_type?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ["customer-tickets", filters],
    queryFn: async (): Promise<{
      data: (Ticket & {
        service_providers: {
          id: string;
          shop_name: string;
          city: string;
          avg_rating: number;
        } | null;
      })[];
      count: number;
    }> => {
      let query = supabase
        .from("tickets")
        .select("*, service_providers(id, shop_name, city, avg_rating)", {
          count: "exact",
        })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.device_type)
        query = query.eq("device_type", filters.device_type);
      if (filters?.from) query = query.gte("created_at", filters.from);
      if (filters?.to) query = query.lte("created_at", filters.to);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        data:
          (data as (Ticket & {
            service_providers: {
              id: string;
              shop_name: string;
              city: string;
              avg_rating: number;
            } | null;
          })[]) ?? [],
        count: count ?? 0,
      };
    },
  });
}

export function useTicketDetail(ticketId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          *,
          service_providers(*),
          quotes(*),
          deliveries(*),
          ticket_events(* , profiles(id, full_name, avatar_url))
        `,
        )
        .eq("id", ticketId)
        .single();

      if (error) throw error;
      return data as unknown as Ticket & {
        service_providers?: Record<string, unknown>;
        quotes?: Quote[];
        deliveries?: Delivery[];
        ticket_events?: (TicketEvent & { profiles?: Profile })[];
      };
    },
    enabled: !!ticketId,
  });
}

export function useCreateTicket() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Omit<CreateTicketInput, "issue_images"> & {
        issue_images?: string[];
        customer_id: string;
      },
    ) => {
      // Manually construct the insert payload with proper typing
      const insertPayload = {
        customer_id: input.customer_id,
        device_type: input.device_type,
        brand: input.brand ?? null,
        model: input.model ?? null,
        issue_description: input.issue_description,
        issue_images: input.issue_images ?? [],
        service_mode: input.service_mode as ServiceMode,
        urgency: (input.urgency ?? "standard") as UrgencyLevel,
        customer_address: input.customer_address ?? null,
        preferred_date: input.preferred_date || null,
        provider_id: input.provider_id ?? null,
        status: "submitted" as const,
      };

      const { data, error } = await supabase
        .from("tickets")
        .insert([insertPayload as unknown as TicketInsert])
        .select()
        .single();

      if (error) throw error;
      return data as Ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-tickets"] });
      toast.success("Repair request submitted successfully!");
    },
    onError: (error: any) => {
      console.error("Ticket Creation Error:", error);
      toast.error(error.message || "Failed to create ticket");
    },
  });
}

export function useUpdateTicketStatus(ticketId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      status,
      completion_report,
    }: {
      status: TicketStatus;
      completion_report?: string;
    }) => {
      const updatePayload: Record<string, unknown> = { status };
      if (completion_report !== undefined) {
        updatePayload.completion_report = completion_report;
      }

      const { data, error } = await supabase
        .from("tickets")
        .update(updatePayload as unknown as TicketUpdate)
        .eq("id", ticketId)
        .select()
        .single();

      if (error) throw error;
      return data as Ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["customer-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["provider-jobs"] });
      toast.success("Status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

export function useCancelTicket(ticketId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tickets")
        .update({ status: "cancelled" })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["customer-tickets"] });
      toast.success("Ticket cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel ticket");
    },
  });
}
