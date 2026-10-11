"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/lib/hooks/use-categories";
import type { Category } from "@/lib/types/book";
import { cn } from "@/lib/utils";

interface CategoryTreeViewProps {
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  excludeId?: string | null;
  className?: string;
}

export function CategoryTreeView({ selectedId, onSelect, excludeId, className }: CategoryTreeViewProps) {
  const { data: categories = [] } = useCategories();

  // Filter out excluded category (e.g., current category being edited)
  const filteredCategories = categories.filter((cat) => cat.id !== excludeId);

  // Build tree structure
  const buildTree = (cats: Category[], parentId: string | null = null): Category[] => {
    return cats
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((cat) => ({
        ...cat,
        children: buildTree(cats, cat.id),
      }));
  };

  const treeCategories = buildTree(filteredCategories);

  const renderTree = (cats: Category[], level: number = 0) => (
    <ul className={cn("space-y-1", level > 0 && "ml-4 border-l border-border/40 pl-4")}>
      {cats.map((category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isSelected = selectedId === category.id;

        return (
          <li key={category.id}>
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
                "hover:bg-accent cursor-pointer",
                isSelected && "bg-accent text-accent-foreground font-medium"
              )}
              onClick={() => onSelect(category.id)}
            >
              {hasChildren ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <span className="w-4 flex-shrink-0" />
              )}
              <span className="truncate">{category.name}</span>
              {category.isHidden && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                  Hidden
                </span>
              )}
            </div>
            {hasChildren && (
              <div className="mt-1">
                {renderTree(category.children!, level + 1)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={cn("max-h-60 overflow-y-auto", className)}>
      {treeCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No categories available
        </p>
      ) : (
        <div className="space-y-1">
          {renderTree(treeCategories)}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full"
        onClick={() => onSelect(null)}
      >
        Clear selection (top-level)
      </Button>
    </div>
  );
}