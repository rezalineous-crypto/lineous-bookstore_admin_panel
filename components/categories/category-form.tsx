"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { CustomInput } from "@/components/ui/custom-input";
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
  formId?: string;
  onSubmittingChange?: (submitting: boolean) => void;
}

export function CategoryForm({
  category,
  onSuccess,
  formId,
  onSubmittingChange,
}: CategoryFormProps) {
  const isEditing = !!category;
  const { data: categories = [] } = useCategories();

  // Filter out current category and its descendants to prevent circular references
  const availableParents = categories.filter((cat) => cat.id !== category?.id);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Report the mutation's pending state so the modal footer can reflect it.
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

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
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pt-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInput
          id="name"
          label="Name"
          placeholder="Enter category name"
          {...register("name", { required: "Name is required" })}
          required
        />

        <CustomInput
          id="slug"
          label="Slug"
          placeholder="enter-category-slug"
          {...register("slug", { required: "Slug is required" })}
          required
        />
      </div>

      <div className="space-y-2 mb-10">
        <SearchableDropdown
          label="Parent Category"
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInput
          id="displayOrder"
          label="Display Order"
          type="number"
          placeholder="0"
          min="0"
          {...register("displayOrder", { valueAsNumber: true })}
        />

        {/* <div className="space-y-2">
          <CustomInput
            id="icon"
            label="Icon"
            placeholder="file-text"
            {...register("icon")}
          />
          <p className="text-xs text-muted-foreground">
            Lucide icon name (e.g., file-text, book-open)
          </p>
        </div> */}

        <div className="space-y-2">
          <CustomInput
            id="route"
            label="Route"
            placeholder="/category-slug"
            {...register("route")}
          />
          <p className="text-xs text-muted-foreground">
            URL path for menu item (e.g., /topical-past-papers)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {/* <Label htmlFor="isHidden">Hidden from Customer Navbar</Label> */}
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
    </form>
  );
}
