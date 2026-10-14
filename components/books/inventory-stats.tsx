import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle, FileText, Archive, AlertTriangle, XCircle } from "lucide-react";
import type { InventorySummary } from "@/lib/types/book";

interface InventoryStatsProps {
  summary: InventorySummary;
}

export function InventoryStats({ summary }: InventoryStatsProps) {
  const stats = [
    {
      label: "Total Books",
      value: summary?.totalBooks.toLocaleString() || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Published",
      value: summary?.publishedBooks.toLocaleString() || 0 ,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Draft",
      value: summary?.draftBooks.toLocaleString() || 0,
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Archived",
      value: summary?.archivedBooks.toLocaleString() || 0,
      icon: Archive,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    // {
    //   label: "Out of Stock",
    //   value: summary?.outOfStock.toLocaleString() || 0,
    //   icon: XCircle,
    //   color: "text-rose-600",
    //   bgColor: "bg-rose-50",
    // },
    // {
    //   label: "Low Stock",
    //   value: summary?.lowStock.toLocaleString() || 0,
    //   icon: AlertTriangle,
    //   color: "text-orange-600",
    //   bgColor: "bg-orange-50",
    // },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats?.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/60 bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-md ${stat.bgColor} ${stat.color} transition-transform duration-300 hover:scale-110`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
