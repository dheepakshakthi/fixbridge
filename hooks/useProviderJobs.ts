"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { SubmitQuoteInput } from "@/schemas/quote";
import type { TicketStatus, QuoteInsert, TicketUpdate } from "@/types";

export function useNewRequests(deviceCategories?: string[]) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["provider-new-requests", deviceCategories],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select("*, profiles!customer_id(id, full_name)")
        .eq("status", "submitted")
        .is("provider_id", null)
        .order("created_at", { ascending: false });

      if (deviceCategories?.length) {
        query = query.in("device_type", deviceCategories);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useActiveJobs() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["provider-active-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, profiles!customer_id(id, full_name, phone), quotes(*)")
        .in("status", ["accepted", "in_repair"])
        .order("updated_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAcceptTicket() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      providerId,
    }: {
      ticketId: string;
      providerId: string;
    }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ status: "accepted", provider_id: providerId })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-new-requests"] });
      queryClient.invalidateQueries({ queryKey: ["provider-active-jobs"] });
      toast.success("Job accepted!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept job");
    },
  });
}

export function useRejectTicket() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId }: { ticketId: string; reason?: string }) => {
      // Log rejection in ticket_events and remove provider
      const { error } = await supabase
        .from("tickets")
        .update({ provider_id: null })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-new-requests"] });
      toast.success("Job rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject job");
    },
  });
}

export function useSubmitQuote() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: SubmitQuoteInput & { ticket_id: string; provider_id: string },
    ) => {
      const { data, error } = await supabase
        .from("quotes")
        .insert([
          {
            ticket_id: input.ticket_id,
            provider_id: input.provider_id,
            amount: input.amount,
            currency: input.currency,
            line_items: input.line_items,
            estimated_days: input.estimated_days,
            notes: input.notes,
            valid_until: input.valid_until,
            status: "pending",
          } as QuoteInsert,
        ])
        .select()
        .single();

      if (error) throw error;

      // Update ticket status to quoted
      const { error: ticketError } = await supabase
        .from("tickets")
        .update({ status: "quoted" })
        .eq("id", input.ticket_id);

      if (ticketError) throw ticketError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-active-jobs"] });
      toast.success("Quote submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit quote");
    },
  });
}

export function useUpdateJobStatus(ticketId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      status,
      completion_report,
      internal_notes,
    }: {
      status: TicketStatus;
      completion_report?: string;
      internal_notes?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };
      if (completion_report !== undefined)
        updateData.completion_report = completion_report;
      if (internal_notes !== undefined)
        updateData.internal_notes = internal_notes;

      const { error } = await supabase
        .from("tickets")
        .update(updateData as unknown as TicketUpdate)
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-active-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      toast.success("Job status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update job status");
    },
  });
}

export function useCompletedJobs(filters?: { from?: string; to?: string }) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["provider-completed-jobs", filters],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select("*, quotes(*), reviews(*)")
        .eq("status", "completed")
        .order("updated_at", { ascending: false });

      if (filters?.from) query = query.gte("updated_at", filters.from);
      if (filters?.to) query = query.lte("updated_at", filters.to);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
