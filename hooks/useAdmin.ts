"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { TicketStatus, UserRole } from "@/types";

export function usePendingProviders() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["admin", "pending-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*, profiles!profile_id(id, full_name, phone)")
        .eq("is_verified", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useVerifyProvider() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerId }: { providerId: string }) => {
      const { error } = await supabase.functions.invoke("verify-provider", {
        body: { provider_id: providerId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-providers"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-providers"] });
      toast.success("Provider verified successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify provider");
    },
  });
}

export function useAllTickets(filters?: {
  status?: TicketStatus;
  device_type?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ["admin", "all-tickets", filters],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(
          "*, profiles!customer_id(id, full_name), service_providers(id, shop_name)",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.device_type)
        query = query.eq("device_type", filters.device_type);
      if (filters?.from) query = query.gte("created_at", filters.from);
      if (filters?.to) query = query.lte("created_at", filters.to);
      if (filters?.search) {
        query = query.or(`ticket_number.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });
}

export function useDisputedTickets() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["admin", "disputed-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          "*, profiles!customer_id(id, full_name), service_providers(id, shop_name)",
        )
        .eq("status", "disputed")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResolveDispute() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      resolution,
    }: {
      ticketId: string;
      resolution: string;
      notes: string;
    }) => {
      const newStatus: TicketStatus =
        resolution === "favour_customer"
          ? "cancelled"
          : resolution === "favour_provider"
            ? "completed"
            : "disputed";

      const { error } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "disputed-tickets"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-tickets"] });
      toast.success("Dispute resolved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resolve dispute");
    },
  });
}

export function useAllUsers(filters?: {
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ["admin", "all-users", filters],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters?.role) query = query.eq("role", filters.role);
      if (filters?.is_active !== undefined)
        query = query.eq("is_active", filters.is_active);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });
}

export function useSuspendUser() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      suspend,
    }: {
      userId: string;
      suspend: boolean;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !suspend })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-users"] });
      toast.success("User status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });
}

export function useAllProviders(filters?: {
  is_verified?: boolean;
  device_category?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ["admin", "all-providers", filters],
    queryFn: async () => {
      let query = supabase
        .from("service_providers")
        .select("*, profiles!profile_id(id, full_name, phone)", {
          count: "exact",
        })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters?.is_verified !== undefined)
        query = query.eq("is_verified", filters.is_verified);
      if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters?.device_category)
        query = query.contains("device_categories", [filters.device_category]);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });
}
