"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import {
  useCreateCategory,
  useUpdateCategory,
  useCategories,
} from "@/lib/hooks/use-categories";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "@/lib/types/book";
import { slugify } from "@/lib/utils";

type CategoryFormValues = {
  name: string;
  slug: string;
  parentId: string | null;
  isHidden: boolean;
  displayOrder: number;
  icon: string;
  route: string;
};

interface CategoryFormProps {
  category?: Category | null;
  onSuccess?: (categoryId?: string) => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEditing = !!category;
  const { data: categories = [] } = useCategories();

  // Filter out current category and its descendants to prevent circular references
  const availableParents = categories.filter((cat) => cat.id !== category?.id);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const { register, handleSubmit, setValue, watch, reset } = useForm<CategoryFormValues>({
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      parentId: category?.parentId || null,
      isHidden: category?.isHidden || false,
      displayOrder: category?.displayOrder || 0,
      icon: category?.icon || "",
      route: category?.route || "",
    },
  });

  // Auto-generate slug from name
  const nameValue = watch("name");
  useEffect(() => {
    if (!isEditing) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, isEditing, setValue]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (isEditing && category) {
      const dto: UpdateCategoryDto = {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        isHidden: data.isHidden,
        displayOrder: data.displayOrder,
        icon: data.icon || undefined,
        route: data.route || undefined,
      };
      await updateMutation.mutateAsync({ id: category.id, dto });
      onSuccess?.();
    } else {
      const dto: CreateCategoryDto = {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        isHidden: data.isHidden,
        displayOrder: data.displayOrder,
        icon: data.icon || undefined,
        route: data.route || undefined,
      };
      const result = await createMutation.mutateAsync(dto);
      onSuccess?.(result.data.id);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register("name", { required: "Name is required" })}
            placeholder="Enter category name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register("slug", { required: "Slug is required" })}
            placeholder="enter-category-slug"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category</Label>
        <SearchableDropdown
          items={availableParents.map((cat) => ({
            id: cat.id,
            label: cat.name,
          }))}
          value={watch("parentId") || ""}
          onChange={(item) => {
            if (item) {
              setValue("parentId", String(item.id));
            } else {
              setValue("parentId", null);
            }
          }}
          placeholder="Select parent category (optional)"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty for top-level category
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            {...register("displayOrder", { valueAsNumber: true })}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Input
            id="icon"
            {...register("icon")}
            placeholder="file-text"
          />
          <p className="text-xs text-muted-foreground">
            Lucide icon name (e.g., file-text, book-open)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="route">Route</Label>
          <Input
            id="route"
            {...register("route")}
            placeholder="/category-slug"
          />
          <p className="text-xs text-muted-foreground">
            URL path for menu item (e.g., /topical-past-papers)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="isHidden">Hidden from Customer Navbar</Label>
        <div className="flex items-center gap-2">
          <Switch
            id="isHidden"
            {...register("isHidden")}
            checked={watch("isHidden")}
          />
          <span className="text-sm text-muted-foreground">
            Hide this category from the customer-facing navigation menu
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : isEditing
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}