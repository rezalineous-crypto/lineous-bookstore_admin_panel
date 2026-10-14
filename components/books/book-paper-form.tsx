"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect, type ChangeEvent, type ReactNode } from "react";
import {
  DollarSign,
  Image as ImageIcon,
  Info,
  Package,
  type LucideIcon,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { CustomInput } from "@/components/ui/custom-input";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { CustomFileUpload } from "@/components/ui/custom-file-upload";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateBookPaper, useUpdateBookPaper } from "@/lib/hooks/use-books";
import type {
  BookPaper,
  CreateBookPaperDto,
  UpdateBookPaperDto,
} from "@/lib/types/book";

type BookPaperFormValues = {
  code?: string;
  name: string;
  price: string;
  discountPrice?: string;
  discountStartDate?: string;
  discountEndDate?: string;
  stock: string;
  isbn?: string;
  pageCount?: string;
  sortOrder: string;
  isDefault: boolean;
  status: "DRAFT" | "PUBLISHED";
};

interface BookPaperFormProps {
  bookId: string;
  paper?: BookPaper | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  onSubmittingChange?: (submitting: boolean) => void;
}

function FormSection({
  icon: Icon,
  title,
  description,
  iconClassName,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  iconClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-background p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/70 pb-4">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-5 pt-5">{children}</div>
    </section>
  );
}

export function BookPaperForm({
  bookId,
  paper,
  onSuccess,
  formId,
  onSubmittingChange,
}: BookPaperFormProps) {
  const isEditing = !!paper;
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [showDiscount, setShowDiscount] = useState(
    !!(
      paper?.discountPrice ||
      paper?.discountStartDate ||
      paper?.discountEndDate
    )
  );

  const createMutation = useCreateBookPaper();
  const updateMutation = useUpdateBookPaper();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Report the mutation's pending state so the modal footer can reflect it.
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookPaperFormValues>({
    defaultValues: {
      code: paper?.code || "",
      name: paper?.name || "",
      price: paper?.price ? String(paper.price) : "",
      discountPrice: paper?.discountPrice ? String(paper.discountPrice) : "",
      discountStartDate: paper?.discountStartDate || "",
      discountEndDate: paper?.discountEndDate || "",
      stock: paper?.stock ? String(paper.stock) : "0",
      isbn: paper?.isbn || "",
      pageCount: paper?.pageCount ? String(paper.pageCount) : "",
      sortOrder: paper?.sortOrder ? String(paper.sortOrder) : "0",
      isDefault: paper?.isDefault || false,
      status: paper?.status || "PUBLISHED",
    },
  });

  const watchPrice = watch("price");

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleDiscountToggle = (checked: boolean) => {
    setShowDiscount(checked);
    if (!checked) {
      // Clear discount values so they aren't submitted while hidden.
      setValue("discountPrice", "");
      setValue("discountStartDate", "");
      setValue("discountEndDate", "");
    }
  };

  const onSubmit = async (data: BookPaperFormValues) => {
    const price = parseFloat(data.price);
    const discountPrice = data.discountPrice
      ? parseFloat(data.discountPrice)
      : undefined;

    // Validate discount price
    if (discountPrice !== undefined && discountPrice > price) {
      toast.error("Discount price cannot be greater than base price");
      return;
    }

    // Validate discount date range
    if (data.discountStartDate && data.discountEndDate) {
      if (new Date(data.discountStartDate) > new Date(data.discountEndDate)) {
        toast.error("Discount start date cannot be after end date");
        return;
      }
    }

    if (isEditing && paper) {
      if (thumbnailFile) {
        // Use FormData when thumbnail is being updated
        const formData = new FormData();
        formData.append("code", data.code || "");
        formData.append("name", data.name);
        formData.append("price", String(price));
        if (discountPrice !== undefined)
          formData.append("discountPrice", String(discountPrice));
        if (data.discountStartDate)
          formData.append("discountStartDate", data.discountStartDate);
        if (data.discountEndDate)
          formData.append("discountEndDate", data.discountEndDate);
        formData.append("stock", String(parseInt(data.stock) || 0));
        if (data.isbn) formData.append("isbn", data.isbn);
        if (data.pageCount)
          formData.append("pageCount", String(parseInt(data.pageCount)));
        formData.append("sortOrder", String(parseInt(data.sortOrder) || 0));
        formData.append("isDefault", String(data.isDefault));
        formData.append("status", data.status);
        formData.append("thumbnail", thumbnailFile);

        try {
          await updateMutation.mutateAsync({ id: paper.id, data: formData });
          toast.success("Paper updated successfully");
          onSuccess?.();
        } catch (error) {
          console.error("Failed to update paper:", error);
        }
      } else {
        const updateData: UpdateBookPaperDto = {
          code: data.code || undefined,
          name: data.name,
          price,
          discountPrice,
          discountStartDate: data.discountStartDate || undefined,
          discountEndDate: data.discountEndDate || undefined,
          stock: parseInt(data.stock) || 0,
          isbn: data.isbn || undefined,
          pageCount: data.pageCount ? parseInt(data.pageCount) : undefined,
          sortOrder: parseInt(data.sortOrder) || 0,
          isDefault: data.isDefault,
          status: data.status,
        };

        try {
          await updateMutation.mutateAsync({ id: paper.id, data: updateData });
          toast.success("Paper updated successfully");
          onSuccess?.();
        } catch (error) {
          console.error("Failed to update paper:", error);
        }
      }
    } else {
      const formData = new FormData();
      formData.append("bookId", bookId);
      if (data.code) formData.append("code", data.code);
      formData.append("name", data.name);
      formData.append("price", String(price));
      if (discountPrice !== undefined)
        formData.append("discountPrice", String(discountPrice));
      if (data.discountStartDate)
        formData.append("discountStartDate", data.discountStartDate);
      if (data.discountEndDate)
        formData.append("discountEndDate", data.discountEndDate);
      formData.append("stock", String(parseInt(data.stock) || 0));
      if (data.isbn) formData.append("isbn", data.isbn);
      if (data.pageCount)
        formData.append("pageCount", String(parseInt(data.pageCount)));
      formData.append("sortOrder", String(parseInt(data.sortOrder) || 0));
      formData.append("isDefault", String(data.isDefault));
      formData.append("status", data.status);
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      try {
        await createMutation.mutateAsync(formData);
        toast.success("Paper created successfully");
        onSuccess?.();
      } catch (error) {
        console.error("Failed to create paper:", error);
      }
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 01 — Basic information */}
      <FormSection
        icon={Info}
        iconClassName="bg-blue-500/10 text-blue-600"
        title="Basic information"
        // description="The essential details that identify this paper variant."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <CustomInput
              id="name"
              label="Name"
              placeholder="Paper A"
              {...register("name", { required: "Name is required" })}
              required
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <CustomInput
            id="code"
            label="Code"
            placeholder="A, MCQ, ENG"
            {...register("code")}
          />
        </div>
      </FormSection>

      {/* 02 — Pricing */}
      <FormSection
        icon={DollarSign}
        iconClassName="bg-emerald-500/10 text-emerald-600"
        title="Pricing"
        // description="Set the base price and an optional discount."
      >
        <div className="space-y-2">
          <CustomInput
            id="price"
            label="Price"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("price", { required: "Price is required", min: 0 })}
            required
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <CustomCheckbox
          checked={showDiscount}
          onCheckedChange={handleDiscountToggle}
          label="Enable discount"
          description="Offer a discounted price, optionally within a date range."
        />

        {showDiscount && (
          <div className="space-y-5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <CustomInput
                id="discountPrice"
                label="Discount Price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("discountPrice", {
                  min: 0,
                  validate: (val) => {
                    if (!val) return true;
                    const price = parseFloat(watchPrice);
                    if (parseFloat(val) > price) {
                      return "Discount price cannot exceed base price";
                    }
                    return true;
                  },
                })}
              />
              {errors.discountPrice && (
                <p className="text-xs text-destructive">
                  {errors.discountPrice.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <CustomDatePicker
                label="Discount Start Date"
                value={watch("discountStartDate") || ""}
                onChange={(date) =>
                  setValue("discountStartDate", date, { shouldValidate: true })
                }
              />

              <CustomDatePicker
                label="Discount End Date"
                value={watch("discountEndDate") || ""}
                onChange={(date) =>
                  setValue("discountEndDate", date, { shouldValidate: true })
                }
              />
            </div>
          </div>
        )}
      </FormSection>

      {/* 03 — Inventory & details */}
      <FormSection
        icon={Package}
        iconClassName="bg-amber-500/10 text-amber-600"
        title="Inventory & details"
        // description="Stock levels and identifying information for this paper."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-10">
          <CustomInput
            id="stock"
            label="Stock"
            type="number"
            placeholder="0"
            {...register("stock")}
          />

          <CustomInput
            id="sortOrder"
            label="Sort Order"
            type="number"
            placeholder="0"
            {...register("sortOrder")}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <CustomInput
            id="pageCount"
            label="Page Count"
            type="number"
            placeholder="300"
            {...register("pageCount")}
          />

          <CustomInput
            id="isbn"
            label="ISBN"
            placeholder="978-..."
            {...register("isbn")}
          />
        </div>
      </FormSection>

      {/* 04 — Media & visibility */}
      <FormSection
        icon={ImageIcon}
        iconClassName="bg-violet-500/10 text-violet-600"
        title="Media & visibility"
        // description="Thumbnail, default selection, and publish status."
      >
        <CustomFileUpload
          label="Paper Thumbnail"
          accept="image/*"
          buttonText="Choose image"
          previewUrl={thumbnailPreview || paper?.thumbnail || null}
          previewLabel={
            thumbnailFile ? "New thumbnail preview" : "Current thumbnail"
          }
          onChange={handleThumbnailChange}
          onClear={() => setThumbnailFile(null)}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isDefault">Default Paper</Label>
              <p className="text-xs text-muted-foreground">
                Only one paper per book can be default
              </p>
            </div>
            <Switch
              id="isDefault"
              checked={watch("isDefault")}
              onCheckedChange={(checked) => setValue("isDefault", checked)}
            />
          </div>

          <div className="pt-6">
            <SearchableDropdown
              label="Status"
              items={[
                { id: "DRAFT", label: "Draft" },
                { id: "PUBLISHED", label: "Published" },
              ]}
              value={watch("status")}
              onChange={(item) => {
                if (item) setValue("status", item.id as "DRAFT" | "PUBLISHED");
              }}
              placeholder="Select status"
            />
          </div>
        </div>
      </FormSection>
    </form>
  );
}
