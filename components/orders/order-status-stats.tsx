import {
  Clock,
  CheckCircle,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { orderStatusConfig } from "@/constants/status";
import type { OrderStatus, OrderStatusStat } from "@/lib/types/book";

// Per-status icon + accent, mirroring the dashboard KPI card styling.
const statusVisual: Record<
  OrderStatus,
  { icon: LucideIcon; accent: string; accentBg: string; ring: string }
> = {
  PENDING: { icon: Clock, accent: "text-amber-600", accentBg: "bg-amber-50", ring: "ring-amber-100" },
  CONFIRMED: { icon: CheckCircle, accent: "text-blue-600", accentBg: "bg-blue-50", ring: "ring-blue-100" },
  PROCESSING: { icon: RefreshCw, accent: "text-violet-600", accentBg: "bg-violet-50", ring: "ring-violet-100" },
  SHIPPED: { icon: Truck, accent: "text-cyan-600", accentBg: "bg-cyan-50", ring: "ring-cyan-100" },
  DELIVERED: { icon: CheckCircle2, accent: "text-emerald-600", accentBg: "bg-emerald-50", ring: "ring-emerald-100" },
  CANCELLED: { icon: XCircle, accent: "text-rose-600", accentBg: "bg-rose-50", ring: "ring-rose-100" },
  RETURNED: { icon: Undo2, accent: "text-orange-600", accentBg: "bg-orange-50", ring: "ring-orange-100" },
};

const fallbackVisual = {
  icon: Clock,
  accent: "text-muted-foreground",
  accentBg: "bg-muted",
  ring: "ring-muted",
};

interface OrderStatusStatsProps {
  stats: OrderStatusStat[];
  totalOrders?: number;
  visibleStatuses?: OrderStatus[];
  onStatusClick?: (status: string) => void;
}

export function OrderStatusStats({
  stats,
  totalOrders,
  visibleStatuses,
  onStatusClick,
}: OrderStatusStatsProps) {
  const filteredStats = visibleStatuses
    ? stats.filter((stat) => visibleStatuses.includes(stat.status))
    : stats;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {filteredStats?.map((stat) => {
        const config = orderStatusConfig[stat.status] || {
          label: stat.status,
        };
        const visual = statusVisual[stat.status] || fallbackVisual;
        const Icon = visual.icon;

        return (
          <Card
            key={stat.status}
            className={`group relative overflow-hidden border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
              onStatusClick ? "cursor-pointer" : ""
            }`}
            onClick={() => onStatusClick?.(stat.status)}
          >
            {/* Faint oversized icon watermark */}
            <Icon
              className={`absolute -right-3 -top-3 h-24 w-24 opacity-[0.04] ${visual.accent}`}
              strokeWidth={1.5}
            />

            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${visual.accentBg} ${visual.accent} ring-4 ${visual.ring} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    {config.label}
                  </p>
                  <h3 className="mt-1 text-3xl font-bold tracking-tight">
                    {stat.count.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
