"use client";

import { Download, FileText, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/utils";
import type { SalesByCategory } from "@/lib/types/book";

interface SalesByCategoryProps {
  data: SalesByCategory[];
  period: string;
  onExport?: () => void;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

export function SalesByCategoryChart({ data, period, onExport }: SalesByCategoryProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sales by Category
            </CardTitle>
            <Badge variant="secondary">{period}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-lg font-medium text-foreground">No category data available</p>
            <p className="text-sm text-muted-foreground">Sales data will appear here when orders are placed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

  // Prepare data for display
  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    revenue: item.revenue,
    orders: item.orders,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
    isHidden: item.isHidden,
  }));

  // Find max revenue for bar scaling
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Sales by Category
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{period}</Badge>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{formatBDT(totalRevenue)}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalOrders}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Categories</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{data.length}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Order Value</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {totalOrders > 0 ? formatBDT(totalRevenue / totalOrders) : formatBDT(0)}
              </p>
            </div>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="space-y-3 mb-6">
            {chartData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span
                      className="h-3 w-3 rounded flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium truncate">{item.name}</span>
                    {item.isHidden && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-right min-w-[180px]">
                    <span className="font-medium text-foreground w-28">{formatBDT(item.revenue)}</span>
                    <span className="text-muted-foreground w-16">{item.orders} orders</span>
                    <span className="text-muted-foreground w-20">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: maxRevenue > 0 ? `${(item.revenue / maxRevenue) * 100}%` : "0%",
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                  <th className="px-4 py-3 text-right font-medium">Orders</th>
                  <th className="px-4 py-3 text-right font-medium">% of Total</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => (
                  <tr key={item.name} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatBDT(item.revenue)}</td>
                    <td className="px-4 py-3 text-right">{item.orders}</td>
                    <td className="px-4 py-3 text-right">{item.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      {item.isHidden ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          Hidden
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                          Visible
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
  );
}