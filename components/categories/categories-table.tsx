"use client";

import { useState } from "react";
import { MoreHorizontal, ChevronUp, ChevronDown, GripVertical } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useCategories, useUpdateCategory, useToggleCategoryHidden, useReorderCategories, useDeleteCategory } from "@/lib/hooks/use-categories";
import type { Category } from "@/lib/types/book";
import { cn } from "@/lib/utils";

interface CategoriesTableProps {
  onView?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function CategoriesTable({ onView, onEdit, onDelete }: CategoriesTableProps) {
  const { data: categories, isLoading, error } = useCategories();
  const updateMutation = useUpdateCategory();
  const toggleHiddenMutation = useToggleCategoryHidden();
  const reorderMutation = useReorderCategories();
  const deleteMutation = useDeleteCategory();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrderValue, setEditingOrderValue] = useState<number>(0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(categories?.map((c) => c.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((i) => i !== id));
  };

  const handleToggleHidden = (category: Category) => {
    toggleHiddenMutation.mutate({ id: category.id, isHidden: !category.isHidden });
  };

  const handleBulkToggleHidden = (isHidden: boolean) => {
    selectedIds.forEach((id) => {
      toggleHiddenMutation.mutate({ id, isHidden });
    });
    setSelectedIds([]);
  };

  const handleBulkReorder = () => {
    if (selectedIds.length === 0) return;
    const updates = selectedIds.map((id, index) => ({
      id,
      displayOrder: index + 1,
    }));
    reorderMutation.mutate(updates);
    setSelectedIds([]);
  };

  const startEditOrder = (category: Category) => {
    setEditingOrderId(category.id);
    setEditingOrderValue(category.displayOrder);
  };

  const saveEditOrder = (id: string) => {
    updateMutation.mutate({ id, dto: { displayOrder: editingOrderValue } });
    setEditingOrderId(null);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load categories";
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">{errorMessage}</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No categories found</p>
      </div>
    );
  }

  // Build tree structure for display
  const buildTree = (cats: Category[], parentId: string | null = null): Category[] => {
    return cats
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((cat) => ({
        ...cat,
        children: buildTree(cats, cat.id),
      }));
  };

  const treeCategories = buildTree(categories);

  const renderCategoryRow = (category: Category, level: number = 0): React.ReactNode => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedIds.includes(category.id);
    const isEditingOrder = editingOrderId === category.id;

    return (
      <>
        <tr
          key={category.id}
          className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/20"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <td className="px-6 py-4 w-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked: boolean) => handleSelectOne(category.id, checked)}
              disabled={isEditingOrder}
            />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              {level > 0 && <span className="text-muted-foreground">{"└─"}</span>}
              <span className="font-medium">{category.name}</span>
              {category.isHidden && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  Hidden
                </span>
              )}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
            {category.slug}
          </td>
          <td className="px-6 py-4 text-sm text-muted-foreground">
            {category.parentId ? (
              categories.find((c) => c.id === category.parentId)?.name || "—"
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </td>
          <td className="px-6 py-4">
            <Switch
              checked={category.isHidden}
              onCheckedChange={() => handleToggleHidden(category)}
              disabled={toggleHiddenMutation.isPending}
              aria-label={category.isHidden ? "Show category" : "Hide category"}
            />
          </td>
          <td className="px-6 py-4">
            {isEditingOrder ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editingOrderValue}
                  onChange={(e) => setEditingOrderValue(parseInt(e.target.value) || 0)}
                  onBlur={() => saveEditOrder(category.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEditOrder(category.id)}
                  className="w-20"
                  min="0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => saveEditOrder(category.id)}
                  className="h-6 w-6"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEditOrder(category)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            )}
            {!isEditingOrder && (
              <span className="ml-2 text-sm font-medium">{category.displayOrder}</span>
            )}
          </td>
          {/* <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
            {category.icon || "—"}
          </td> */}
          <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
            {category.route || "—"}
          </td>
          <td className="px-6 py-4 text-sm text-muted-foreground">
            {category._count?.books || 0}
          </td>
          <td className="px-6 py-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onView?.(category)}
                  disabled={updateMutation.isPending || toggleHiddenMutation.isPending}
                >
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit?.(category)}
                  disabled={updateMutation.isPending || toggleHiddenMutation.isPending}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleToggleHidden(category)}
                  disabled={toggleHiddenMutation.isPending}
                >
                  {category.isHidden ? "Show in Menu" : "Hide from Menu"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(category)}
                  className="text-destructive focus:text-destructive"
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
        {hasChildren && (
          <>
            {category.children?.map((child) => renderCategoryRow(child, level + 1))}
          </>
        )}
      </>
    );
  };

  const isAllSelected = categories && categories.length > 0 && selectedIds.length === categories.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < (categories?.length || 0);

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkToggleHidden(true)}
            disabled={toggleHiddenMutation.isPending}
          >
            Show in Menu
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkToggleHidden(false)}
            disabled={toggleHiddenMutation.isPending}
          >
            Hide from Menu
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkReorder}
            disabled={reorderMutation.isPending}
          >
            Reorder (1, 2, 3...)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <table className="w-full">
          <thead className="bg-gray-100 font-bold">
            <tr className="border-b border-border/60 bg-muted/30 text-left text-sm">
              <th className="px-6 py-4 font-semibold text-gray-500 w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-indeterminate={isIndeterminate}
                />
              </th>
              <th className="px-6 py-4 font-semibold text-gray-500">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Slug</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Parent</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Hidden</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Display Order</th>
              {/* <th className="px-6 py-4 font-semibold text-gray-500">Icon</th> */}
              <th className="px-6 py-4 font-semibold text-gray-500">Route</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Books Count</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {treeCategories.map((category) => renderCategoryRow(category))}
          </tbody>
        </table>
      </div>
    </div>
  );
}