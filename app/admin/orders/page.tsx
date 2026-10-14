"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";

import { OrdersTable } from "@/components/orders/orders-table";
import { OrderDetailDialog } from "@/components/orders/order-detail-dialog";
import { OrderStatusStats } from "@/components/orders/order-status-stats";
import type { Order } from "@/lib/types/book";
import { OrderStatus as OrderStatusEnum, orderStatusConfig } from "@/constants/status";
import { useOrderStatusStats } from "@/lib/hooks/use-orders";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: statusStats, isLoading: statsLoading } = useOrderStatusStats();

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleStatusClick = (status: string) => {
    setStatusFilter(status);
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Manage customer orders and fulfillment.
          </p>
        </div>
      </div>

      {/* Order Status Stats */}
      {!statsLoading && statusStats && (
        <OrderStatusStats
          stats={statusStats.stats}
          totalOrders={statusStats.totalOrders}
          visibleStatuses={["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]}
          onStatusClick={handleStatusClick}
        />
      )}

      <OrdersTable onView={handleView} />

      <OrderDetailDialog
        orderId={selectedOrder?.id ?? null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
