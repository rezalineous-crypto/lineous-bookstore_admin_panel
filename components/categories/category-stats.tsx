"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, EyeOff, FolderKanban, FolderTree } from "lucide-react";
import type { Category } from "@/lib/types/book";

interface CategoryStatsProps {
  categories: Category[];
}

export function CategoryStats({ categories }: CategoryStatsProps) {
  const totalCategories = categories.length;
  const hiddenCategories = categories.filter((c) => c.isHidden).length;
  const rootCategories = categories.filter((c) => !c.parentId).length;
  const categoriesWithChildren = categories.filter((c) =>
    categories.some((child) => child.parentId === c.id)
  ).length;

  const stats = [
    {
      label: "Total Categories",
      value: totalCategories.toLocaleString(),
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Root Categories",
      value: rootCategories.toLocaleString(),
      icon: FolderKanban,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "With Subcategories",
      value: categoriesWithChildren.toLocaleString(),
      icon: FolderTree,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Hidden",
      value: hiddenCategories.toLocaleString(),
      icon: EyeOff,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
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