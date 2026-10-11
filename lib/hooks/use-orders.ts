"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api/orders";
import { QueryKeys } from "@/constants/query-key";
import type { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderShippingDto } from "@/lib/types/book";

// Hook to fetch all orders
export function useOrders(categoryId?: string) {
  return useQuery({
    queryKey: categoryId ? [...QueryKeys.orders, "category", categoryId] : QueryKeys.orders,
    queryFn: async () => {
      const response = await ordersApi.getOrders(categoryId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Hook to fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: [...QueryKeys.orders, id],
    queryFn: async () => {
      const response = await ordersApi.getOrder(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateOrderDto) => {
      const response = await ordersApi.createOrder(dto);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders });
      toast.success(response.message || "Order created successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderStatusDto }) => {
      const response = await ordersApi.updateOrderStatus(id, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders });
      queryClient.invalidateQueries({ queryKey: [...QueryKeys.orders, variables.id] });
      toast.success(response.message || "Order status updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to update order shipping (delivery charge)
export function useUpdateOrderShipping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, shipping }: { id: string; shipping: number }) => {
      const response = await ordersApi.updateOrderShipping(id, shipping);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders });
      queryClient.invalidateQueries({ queryKey: [...QueryKeys.orders, variables.id] });
      queryClient.invalidateQueries({ queryKey: QueryKeys.receiptDetails(variables.id) });
      toast.success(response.message || "Delivery charge updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to fetch receipt details for an order
export function useReceiptDetails(orderId: string) {
  return useQuery({
    queryKey: QueryKeys.receiptDetails(orderId),
    queryFn: async () => {
      const response = await ordersApi.getReceiptDetails(orderId);
      return response.data;
    },
    enabled: !!orderId,
  });
}

// Hook to generate (or regenerate) a receipt
export function useGenerateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await ordersApi.generateReceipt(orderId);
      return response;
    },
    onSuccess: (response, orderId) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders });
      queryClient.invalidateQueries({ queryKey: QueryKeys.receiptDetails(orderId) });
      queryClient.invalidateQueries({ queryKey: [...QueryKeys.orders, orderId] });
      toast.success(response.message || "Receipt generated and order confirmed successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook to download a receipt PDF (triggers a browser download)
// If no receipt exists yet, it generates one first before downloading.
export function useDownloadReceipt() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      // Check whether a receipt already exists for this order.
      try {
        await ordersApi.getReceiptDetails(orderId);
      } catch (error) {
        // If the receipt does not exist (404), generate it before downloading.
        if (error instanceof AxiosError && error.response?.status === 404) {
          await ordersApi.generateReceipt(orderId);
        } else {
          throw error;
        }
      }
      // Now that a receipt is guaranteed to exist, download the PDF.
      return await ordersApi.downloadReceipt(orderId);
    },
    onSuccess: (blob, orderId) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CLC-ORD-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook to publicly verify a receipt by receipt number
export function useVerifyReceipt(receiptNumber: string, enabled = true) {
  return useQuery({
    queryKey: QueryKeys.verifyReceipt(receiptNumber),
    queryFn: async () => {
      const response = await ordersApi.verifyReceipt(receiptNumber);
      return response.data;
    },
    enabled: enabled && !!receiptNumber,
  });
}

// Hook to fetch order status statistics
export function useOrderStatusStats() {
  return useQuery({
    queryKey: QueryKeys.orderStatusStats,
    queryFn: async () => {
      const response = await ordersApi.getOrderStatusStats();
      return response ?? { stats: [], totalOrders: 0 };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
}

// Helper function to extract error message from backend response
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string") {
      return message;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
