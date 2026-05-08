"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import type { ServiceProvider } from "@/types";

export function useProviders(filters?: {
  device_type?: string[];
  city?: string;
  min_rating?: number;
  sort?: "rating" | "reviews" | "name";
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ["providers", filters],
    queryFn: async (): Promise<{ data: ServiceProvider[]; count: number }> => {
      let query = supabase
        .from("service_providers")
        .select("*", { count: "exact" })
        .eq("is_verified", true)
        .eq("is_active", true)
        .range(from, to);

      if (filters?.device_type?.length) {
        query = query.overlaps("device_categories", filters.device_type);
      }
      if (filters?.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters?.min_rating !== undefined) {
        query = query.gte("avg_rating", filters.min_rating);
      }

      if (filters?.sort === "rating")
        query = query.order("avg_rating", { ascending: false });
      else if (filters?.sort === "reviews")
        query = query.order("total_reviews", { ascending: false });
      else if (filters?.sort === "name")
        query = query.order("shop_name", { ascending: true });
      else query = query.order("avg_rating", { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data as ServiceProvider[]) ?? [], count: count ?? 0 };
    },
  });
}

export function useProviderProfile(providerId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["provider", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select(
          "*, reviews(*, profiles!customer_id(id, full_name, avatar_url))",
        )
        .eq("id", providerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
}

export function useProviderStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["provider-stats"],
    queryFn: async () => {
      const [newRequests, activeJobs, readyJobs, providerData] =
        await Promise.all([
          supabase
            .from("tickets")
            .select("id", { count: "exact", head: true })
            .eq("status", "submitted"),
          supabase
            .from("tickets")
            .select("id", { count: "exact", head: true })
            .in("status", ["accepted", "in_repair"]),
          supabase
            .from("tickets")
            .select("id", { count: "exact", head: true })
            .eq("status", "ready"),
          supabase
            .from("service_providers")
            .select("avg_rating, total_reviews")
            .single<Pick<ServiceProvider, "avg_rating" | "total_reviews">>(),
        ]);

      return {
        newRequests: newRequests.count ?? 0,
        activeJobs: activeJobs.count ?? 0,
        readyJobs: readyJobs.count ?? 0,
        avgRating: providerData.data?.avg_rating ?? 0,
        totalReviews: providerData.data?.total_reviews ?? 0,
      };
    },
  });
}
