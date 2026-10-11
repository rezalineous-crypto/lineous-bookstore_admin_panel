"use client";

import { useState } from "react";
import {
  useDashboardStats,
  useRefetchDashboard,
} from "@/lib/hooks/use-dashboard";
import { useSalesByCategory } from "@/lib/hooks/use-analytics";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { OrderStatusBreakdown } from "@/components/dashboard/order-status-breakdown";
import { TopSellingBooks } from "@/components/dashboard/top-selling-books";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SalesTrend } from "@/components/dashboard/sales-trend";
import { SalesByCategoryChart } from "@/components/analytics/sales-by-category";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

type Period = "day" | "week" | "month" | "year" | "custom";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("month");
  const { data, isLoading, error, refetch } = useDashboardStats();
  const { data: salesByCategoryData, isLoading: categoryLoading } = useSalesByCategory({
    period,
  });
  const refetchDashboard = useRefetchDashboard();

  // Auto-refresh on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back to your bookstore management system.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-12 text-center">
          <p className="text-lg font-medium text-rose-600">
            Failed to load dashboard data
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
          <Button
            onClick={() => refetchDashboard()}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>

        {/* Recent Orders - empty state on error */}
        <RecentOrders orders={[]} />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back to your bookstore management system.
          </p>
        </div>

        {/* Loading skeleton for KPI cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-muted/30"
            />
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-muted/30" />
          <div className="h-64 animate-pulse rounded-lg bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back to your bookstore management system.
          </p>
        </div>

        <Button onClick={() => refetchDashboard()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <KpiCards kpis={data.kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <SalesTrend data={data.salesTrend} />
        <OrderStatusBreakdown
          data={data.orderStatusBreakdown}
          totalOrders={data.kpis.totalOrders}
        />
      </div>

      {/* Sales by Category */}
      <SalesByCategoryChart
        data={salesByCategoryData ?? []}
        period={period}
      />

      {/* Order Status Breakdown & Top Selling Books */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopSellingBooks books={data.topSellingBooks.slice(0, 5)} />
        {/* Recent Orders */}
        <RecentOrders orders={data.recentOrders} />
      </div>
    </div>
  );
}
