import {
  BookOpen,
  ShoppingCart,
  DollarSign,
  Users,
  Library,
  Building2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardKpis } from "@/lib/types/book";

interface KpiCardsProps {
  kpis: DashboardKpis;
}

// ─── Tier 1: the headline business metrics — get full-size cards ──
const primaryConfig = [
  {
    key: "totalSales" as const,
    label: "Total Sales",
    icon: DollarSign,
    accent: "text-indigo-600",
    accentBg: "bg-indigo-50",
    ring: "ring-indigo-100",
    prefix: "৳",
  },
  {
    key: "totalOrders" as const,
    label: "Total Orders",
    icon: ShoppingCart,
    accent: "text-blue-600",
    accentBg: "bg-blue-50",
    ring: "ring-blue-100",
  },
  {
    key: "totalCustomers" as const,
    label: "Total Customers",
    icon: Users,
    accent: "text-emerald-600",
    accentBg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
];

// ─── Tier 2: catalogue counts — useful, but secondary. Grouped into one compact row instead of three separate cards ──
const secondaryConfig = [
  { key: "totalProducts" as const, label: "Products", icon: BookOpen },
  { key: "totalSubjects" as const, label: "Subjects", icon: Library },
  { key: "totalPublications" as const, label: "Publications", icon: Building2 },
];

// ─── Tier 3: things that need action — visually separated so they don't blend in as "just another number" ──
const alertConfig = [
  {
    key: "pendingOrders" as const,
    label: "Pending Orders",
    icon: Clock,
    accent: "text-amber-700",
    dot: "bg-amber-500",
  },
  {
    key: "lowStockBooks" as const,
    label: "Low Stock Books",
    icon: AlertTriangle,
    accent: "text-rose-700",
    dot: "bg-rose-500",
  },
];

function formatValue(value: number, prefix?: string) {
  return prefix ? `${prefix}${value.toLocaleString()}` : value.toLocaleString();
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="space-y-6">
      {/* ── Tier 1: primary metrics ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {primaryConfig.map((config) => (
          <Card
            key={config.key}
            className="relative overflow-hidden border-border/60 bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
          >
            {/* faint oversized icon watermark for a bit of texture, standard on this kind of card */}
            <config.icon
              className={`absolute -right-3 -top-3 h-24 w-24 opacity-[0.04] ${config.accent}`}
              strokeWidth={1.5}
            />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.accentBg} ${config.accent} ring-4 ${config.ring}`}
                >
                  <config.icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {config.label}
                  </p>
                  <h3 className="mt-1 text-3xl font-bold tracking-tight text-right">
                    {formatValue(kpis[config.key], config.prefix)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tier 2 + Tier 3, side by side: catalogue counts vs. action items ── */}
      {/* <div className="grid gap-6 lg:grid-cols-3">
        Compact divided row instead of three separate boxes — these are related, so they read as one unit
        <Card className="border-border/60 bg-card shadow-card lg:col-span-2">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {secondaryConfig.map((config) => (
                <div key={config.key} className="flex items-center gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <config.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {config.label}
                    </p>
                    <p className="text-xl font-bold tracking-tight">
                      {formatValue(kpis[config.key])}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        Alerts — amber/rose left rail makes it unmistakably "needs attention", not a neutral stat
        <Card className="border-border/60 bg-card shadow-card">
          <CardContent className="space-y-1 p-4">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Needs attention
            </p>
            {alertConfig.map((config) => {
              const isActive = kpis[config.key] > 0;
              return (
                <div
                  key={config.key}
                  className={`flex items-center gap-3 rounded-lg border-l-2 px-2 py-3 transition-colors hover:bg-muted/50 ${
                    isActive
                      ? `border-l-current ${config.accent}`
                      : "border-l-transparent"
                  }`}
                >
                  <span
                    className={`relative flex h-2 w-2 ${config.dot} rounded-full`}
                  >
                    {isActive && (
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.dot} opacity-60`}
                      />
                    )}
                  </span>
                  <config.icon className={`h-4 w-4 ${config.accent}`} />
                  <p className="flex-1 text-sm text-foreground/80">
                    {config.label}
                  </p>
                  <p className={`text-base font-bold ${config.accent}`}>
                    {formatValue(kpis[config.key])}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
