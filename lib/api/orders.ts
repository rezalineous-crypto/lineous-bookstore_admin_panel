import apiClient from "./axios";
import type {
  Order,
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderShippingDto,
  ApiResponse,
  ReceiptDetails,
  ReceiptVerification,
  GenerateReceiptResponse,
  OrderStatusStatsResponse,
} from "@/lib/types/book";

// Get all orders
export const getOrders = async (categoryId?: string): Promise<ApiResponse<Order[]>> => {
  const params = categoryId ? { categoryId } : {};
  const response = await apiClient.get<ApiResponse<Order[]>>("/orders", { params });
  return response.data;
};

// Get order by ID
export const getOrder = async (id: string): Promise<ApiResponse<Order>> => {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  return response.data;
};

// Create order
export const createOrder = async (dto: CreateOrderDto): Promise<ApiResponse<Order>> => {
  const response = await apiClient.post<ApiResponse<Order>>("/orders", dto);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (id: string, dto: UpdateOrderStatusDto): Promise<ApiResponse<Order>> => {
  const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, dto);
  return response.data;
};

// Update order shipping (delivery charge)
export const updateOrderShipping = async (id: string, shipping: number): Promise<ApiResponse<Order>> => {
  const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/shipping`, { shipping });
  return response.data;
};

// Generate (or regenerate) a receipt for an order (Admin only)
export const generateReceipt = async (id: string): Promise<ApiResponse<GenerateReceiptResponse>> => {
  const response = await apiClient.post<ApiResponse<GenerateReceiptResponse>>(`/orders/${id}/receipt`);
  return response.data;
};

// Get detailed receipt information for an order
export const getReceiptDetails = async (id: string): Promise<ApiResponse<ReceiptDetails>> => {
  const response = await apiClient.get<ApiResponse<ReceiptDetails>>(`/orders/${id}/receipt/details`);
  return response.data;
};

// Download the PDF receipt for an order (returns a binary blob)
export const downloadReceipt = async (id: string): Promise<Blob> => {
  const response = await apiClient.get<Blob>(`/orders/${id}/receipt`, {
    responseType: "blob",
  });
  return response.data;
};

// Public: verify a receipt by its receipt number
export const verifyReceipt = async (receiptNumber: string): Promise<ApiResponse<ReceiptVerification>> => {
  const response = await apiClient.get<ApiResponse<ReceiptVerification>>(
    `/receipts/verify/${receiptNumber}`
  );
  return response.data;
};

// Get order status statistics (admin only)
export const getOrderStatusStats = async (): Promise<OrderStatusStatsResponse> => {
  const response = await apiClient.get<OrderStatusStatsResponse>("/admin/orders/status-stats");
  return response.data;
};

export const ordersApi = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updateOrderShipping,
  generateReceipt,
  getReceiptDetails,
  downloadReceipt,
  verifyReceipt,
  getOrderStatusStats,
};

export default ordersApi;
