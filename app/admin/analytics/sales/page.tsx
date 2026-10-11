"use client";

import { useState } from "react";
import {
  useSalesAnalytics,
  useSalesByCategory,
  useRefetchAnalytics,
} from "@/lib/hooks/use-analytics";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PeriodFilter } from "@/components/analytics/period-filter";
import { SalesSummaryCards } from "@/components/analytics/sales-summary-cards";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { PaymentBreakdown } from "@/components/analytics/payment-breakdown";
import { TopProductsTable } from "@/components/analytics/top-products-table";
import { SalesByCategoryChart } from "@/components/analytics/sales-by-category";

type Period = "day" | "week" | "month" | "year" | "custom";

export default function SalesAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading, error, refetch } = useSalesAnalytics({
    period,
    ...(period === "custom" && startDate && endDate
      ? { startDate, endDate }
      : {}),
    groupBy,
  });

  const { data: salesByCategoryData, isLoading: categoryLoading } = useSalesByCategory({
    period,
    ...(period === "custom" && startDate && endDate
      ? { startDate, endDate }
      : {}),
    groupBy,
  });

  const refetchAnalytics = useRefetchAnalytics();

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Detailed sales analytics and performance metrics.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-12 text-center">
          <p className="text-lg font-medium text-rose-600">
            Failed to load analytics data
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
          <Button
            onClick={() => refetchAnalytics()}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Detailed sales analytics and performance metrics.
          </p>
        </div>

        {/* Loading skeleton for summary cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-muted/30"
            />
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg bg-muted/30" />
          <div className="h-80 animate-pulse rounded-lg bg-muted/30" />
        </div>

        {/* Loading skeleton for table */}
        <div className="h-64 animate-pulse rounded-lg bg-muted/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Detailed sales analytics and performance metrics.
          </p>
        </div>

        <Button onClick={() => refetchAnalytics()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Period Filter */}
      <PeriodFilter
        period={period}
        groupBy={groupBy}
        startDate={startDate}
        endDate={endDate}
        onPeriodChange={handlePeriodChange}
        onGroupByChange={setGroupBy}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Summary KPI Cards */}
      <SalesSummaryCards summary={data.summary} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={data.timeSeriesData} />
        <PaymentBreakdown data={data.paymentMethodBreakdown} />
      </div>

      {/* Sales by Category */}
      <SalesByCategoryChart
        data={salesByCategoryData ?? []}
        period={period}
      />

      {/* Top Products Table */}
      <TopProductsTable products={data.topProducts} />
    </div>
  );
}
