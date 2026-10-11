"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { analyticsApi } from "@/lib/api/analytics";
import { QueryKeys } from "@/constants/query-key";
import type { SalesAnalyticsParams, CustomerInsightsParams, SalesByCategory } from "@/lib/types/book";

// Hook to fetch sales analytics
export function useSalesAnalytics(params: SalesAnalyticsParams) {
  return useQuery({
    queryKey: QueryKeys.salesAnalytics(params),
    queryFn: async () => {
      const response = await analyticsApi.getSalesAnalytics(params);
      return response ?? {};
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    enabled: !!params.period,
  });
}

// Hook to fetch sales by category
export function useSalesByCategory(params: SalesAnalyticsParams) {
  return useQuery({
    queryKey: QueryKeys.salesByCategory(params),
    queryFn: async () => {
      const response = await analyticsApi.getSalesByCategory(params);
      return response ?? [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    enabled: !!params.period,
  });
}

// Hook to fetch customer insights
export function useCustomerInsights(params?: CustomerInsightsParams) {
  return useQuery({
    queryKey: QueryKeys.customerInsights(params || {}),
    queryFn: async () => {
      const response = await analyticsApi.getCustomerInsights(params);
      return response ?? {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to fetch top selling books
export function useTopSellingBooks(params?: { limit?: number; period?: "all" | "month" | "week" }) {
  return useQuery({
    queryKey: QueryKeys.topSellingBooks(params || {}),
    queryFn: async () => {
      const response = await analyticsApi.getTopSellingBooks(params);
      return response ?? { books: [] };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to refetch analytics data
export function useRefetchAnalytics() {
  const queryClient = useQueryClient();

  const refetch = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Analytics data refreshed");
    } catch {
      toast.error("Failed to refresh analytics data");
    }
  };

  return refetch;
}
