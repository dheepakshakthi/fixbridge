"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { DeliveryAddress, DeliveryInsert } from "@/types/index";

export function useDeliveryByTicket(ticketId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["delivery", "ticket", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("*")
        .eq("ticket_id", ticketId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  // Realtime subscription - setup but not used, will be optimized later
  supabase
    .channel(`delivery:ticket:${ticketId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "deliveries",
        filter: `ticket_id=eq.${ticketId}`,
      },
      () => {
        queryClient.invalidateQueries({
          queryKey: ["delivery", "ticket", ticketId],
        });
      },
    )
    .subscribe();

  return query;
}

export function useDeliveryByCode(trackingCode: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["delivery", "code", trackingCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("*, tickets(ticket_number, device_type)")
        .eq("tracking_code", trackingCode)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!trackingCode,
  });

  // Realtime subscription for public tracker
  supabase
    .channel(`delivery:code:${trackingCode}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "deliveries",
        filter: `tracking_code=eq.${trackingCode}`,
      },
      () => {
        queryClient.invalidateQueries({
          queryKey: ["delivery", "code", trackingCode],
        });
      },
    )
    .subscribe();

  return query;
}

export function useInitiateDelivery() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      pickupAddress,
      deliveryAddress,
    }: {
      ticketId: string;
      pickupAddress: DeliveryAddress;
      deliveryAddress: DeliveryAddress;
    }) => {
      // Generate tracking code via Edge Function or client-side
      const trackingCode =
        "FXB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

      const insertData: Record<string, unknown> = {
        ticket_id: ticketId,
        tracking_code: trackingCode,
        direction: "return",
        status: "scheduled",
        pickup_address: pickupAddress as unknown as Record<string, unknown>,
        delivery_address: deliveryAddress as unknown as Record<string, unknown>,
        scheduled_at: scheduledAt,
        estimated_delivery: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      const { data, error } = await supabase
        .from("deliveries")
        .insert([insertData as unknown as DeliveryInsert])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
      toast.success("Return delivery initiated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate delivery");
    },
  });
}
