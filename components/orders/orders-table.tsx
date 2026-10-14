"use client";

import { useState } from "react";
import { Download, Loader2, Eye, Truck, FileText, Filter, X } from "lucide-react";

import { useOrders, useUpdateOrderStatus, useDownloadReceipt, useGenerateReceipt } from "@/lib/hooks/use-orders";
import { useCategories } from "@/lib/hooks/use-categories";
import type { Order, OrderStatus, Category } from "@/lib/types/book";
import { OrderStatusBadge, PaymentStatusBadge } from "./order-badges";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { Button } from "@/components/ui/button";
import { SetShippingDialog } from "./set-shipping-dialog";
import { getNextOrderStatuses, OrderStatusLabels } from "@/constants/status";
import { formatBDT } from "@/lib/utils";

interface OrdersTableProps {
  onView?: (order: Order) => void;
}

export function OrdersTable({ onView }: OrdersTableProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { data: orders, isLoading, error } = useOrders(categoryFilter === "all" ? undefined : categoryFilter);
  const updateStatusMutation = useUpdateOrderStatus();
  const downloadReceipt = useDownloadReceipt();
  const generateReceipt = useGenerateReceipt();
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [pendingActions, setPendingActions] = useState<Record<string, "download" | "generate" | "shipping">>({});

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    if (newStatus === order.status) return;
    await updateStatusMutation.mutateAsync({ id: order.id, data: { status: newStatus } });
  };

  const openShippingDialog = (order: Order) => {
    setShippingOrder(order);
    setShippingDialogOpen(true);
  };

  const isPending = (orderId: string, action: "download" | "generate" | "shipping") => pendingActions[orderId] === action;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load orders";
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">{errorMessage}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <table className="w-full">
       <thead className="bg-gray-100 font-bold">
          <tr className="border-b border-border/60 bg-muted/30 text-left text-sm">
             <th className="px-6 py-4 font-semibold text-gray-500">Order</th>
             <th className="px-6 py-4 font-semibold text-gray-500">Customer</th>
             <th className="px-6 py-4 font-semibold text-gray-500">Total</th>
             <th className="px-6 py-4 font-semibold text-gray-500">Shipping</th>
             <th className="px-6 py-4 font-semibold text-gray-500">Order Status</th>
            {/*  <th className="px-6 py-4 font-semibold text-gray-500">Payment</th> */}
             <th className="px-6 py-4 font-semibold text-gray-500">Date</th>
             <th className="px-6 py-4 font-semibold text-gray-500"></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => {
            const nextStatuses = getNextOrderStatuses(order.status);
            const statusOptions = [
              { id: order.status, label: OrderStatusLabels[order.status] },
              ...nextStatuses.map((s) => ({ id: s, label: OrderStatusLabels[s] })),
            ];
            const customerName = order.user
              ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() ||
                order.userId.slice(0, 8)
              : order.userId.slice(0, 8);

            return (
              <tr
                key={order.id}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/20"
              >
                <td className="px-6 py-4">
                  <div>
                    <h4 className="font-medium">{order.orderNumber}</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.orderItems?.length || 0} items
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium">{customerName}</p>
                    {order.user?.email && (
                      <p className="text-sm text-muted-foreground">{order.user.email}</p>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm font-medium">{formatBDT(order.total)}</td>

                <td className="px-6 py-4 text-sm">
                  {parseFloat(order.shipping ?? "0") > 0 ? (
                    <span className="font-medium">{formatBDT(order.shipping)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <SearchableDropdown
                    items={statusOptions}
                    value={order.status}
                    onChange={(item) => {
                      if (item) handleStatusChange(order, item.id as OrderStatus);
                    }}
                    buttonClassName="h-8 w-[150px]"
                    renderSelected={(item) => (
                      <OrderStatusBadge status={item.id as OrderStatus} />
                    )}
                  />
                </td>

                {/* <td className="px-6 py-4">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td> */}

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {order.status === "PENDING" && parseFloat(order.shipping ?? "0") === 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        title="Set delivery charge"
                        onClick={() => openShippingDialog(order)}
                      >
                        <Truck className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Set Charge</span>
                      </Button>
                    ) : order.status === "PENDING" && parseFloat(order.shipping ?? "0") > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        title="Generate receipt and confirm order"
                        disabled={isPending(order.id, "generate")}
                        onClick={() => {
                          setPendingActions((prev) => ({ ...prev, [order.id]: "generate" }));
                          generateReceipt.mutate(order.id, {
                            onSettled: () => {
                              setPendingActions((prev) => {
                                const next = { ...prev };
                                delete next[order.id];
                                return next;
                              });
                            },
                          });
                        }}
                      >
                        {isPending(order.id, "generate") ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Generate Receipt</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-md"
                        title="Download receipt"
                        disabled={isPending(order.id, "download")}
                        onClick={() => {
                          setPendingActions((prev) => ({ ...prev, [order.id]: "download" }));
                          downloadReceipt.mutate(order.id, {
                            onSettled: () => {
                              setPendingActions((prev) => {
                                const next = { ...prev };
                                delete next[order.id];
                                return next;
                              });
                            },
                          });
                        }}
                      >
                        {isPending(order.id, "download") ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md"
                      title="View order"
                      onClick={() => onView?.(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <SetShippingDialog
        order={shippingOrder}
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
      />
    </div>
  );
}
