"use client";

import { ChevronRight, Eye, EyeOff, Menu } from "lucide-react";
import { useCategoriesMenu } from "@/lib/hooks/use-categories";
import type { CategoryMenuResponse } from "@/lib/types/book";
import { cn } from "@/lib/utils";

interface MenuPreviewProps {
  className?: string;
}

export function MenuPreview({ className }: MenuPreviewProps) {
  const { data: menuData, isLoading, error } = useCategoriesMenu();

  const renderMenu = (items: CategoryMenuResponse[], level: number = 0) => (
    <ul className={cn("space-y-1", level > 0 && "ml-4 border-l border-border/40 pl-4")}>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isHidden = item.isHidden;

        return (
          <li key={item.id}>
            <div className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
              isHidden && "opacity-50 bg-muted/50"
            )}>
              {level > 0 && <span className="text-muted-foreground">{"└─"}</span>}
              {item.icon && (
                <span className="text-muted-foreground" style={{ fontFamily: "inherit" }}>
                  [{item.icon}]
                </span>
              )}
              <span className={cn("truncate flex-1", isHidden && "line-through")}>
                {item.name}
              </span>
              {item.route && (
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                  {item.route}
                </span>
              )}
              {isHidden && (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              )}
              {hasChildren && (
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
              )}
            </div>
            {hasChildren && (
              <div className="mt-1">
                {renderMenu(item.children!, level + 1)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-8 animate-pulse rounded bg-muted/30" />
        <div className="h-8 animate-pulse rounded bg-muted/30" />
        <div className="h-8 animate-pulse rounded bg-muted/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8 text-destructive", className)}>
        <p>Failed to load menu preview</p>
      </div>
    );
  }

  if (!menuData || menuData.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Menu className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
        <p>No categories in menu</p>
        <p className="text-sm mt-1">Create categories to build the navigation menu</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Live Menu Preview</h3>
        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
          Customer Navbar
        </span>
      </div>
      <div className="rounded-lg border border-border/60 bg-card p-4 min-h-[200px]">
        <nav className="space-y-1" aria-label="Category navigation preview">
          {renderMenu(menuData)}
        </nav>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
        <span>Visible items</span>
        <span className="w-px h-4 bg-border mx-1" />
        <EyeOff className="h-3 w-3" />
        <span>Hidden items (strikethrough)</span>
      </div>
    </div>
  );
}