"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { Switch } from "@/components/ui/switch";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { CustomInput } from "@/components/ui/custom-input";
import { CustomTextarea } from "@/components/ui/custom-text-area";
import { Label } from "@/components/ui/label";
import {
  useCreatePublication,
  useUpdatePublication,
} from "@/lib/hooks/use-publications";
import type {
  Publication,
  UpdatePublicationDto,
  BookStatus,
} from "@/lib/types/book";
import { BookStatus as BookStatusEnum } from "@/constants/status";
import { slugify } from "@/lib/utils";

type PublicationFormValues = {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  status?: BookStatus;
  isActive?: boolean;
};

interface PublicationFormProps {
  publication?: Publication | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  onSubmittingChange?: (submitting: boolean) => void;
}

export function PublicationForm({
  publication,
  onSuccess,
  formId,
  onSubmittingChange,
}: PublicationFormProps) {
  const isEditing = !!publication;

  const createMutation = useCreatePublication();
  const updateMutation = useUpdatePublication();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Report the mutation's pending state so the modal footer can reflect it.
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const { register, handleSubmit, setValue, watch } = useForm<PublicationFormValues>({
    defaultValues: {
      name: publication?.name || "",
      slug: publication?.slug || "",
      description: publication?.description || "",
      logo: publication?.logo || "",
      status: (publication?.status as BookStatus) || "PUBLISHED",
      isActive: publication?.isActive ?? true,
    },
  });

  // Auto-generate slug from name
  const nameValue = watch("name");
  useEffect(() => {
    if (!isEditing) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, isEditing, setValue]);

  const onSubmit = async (data: PublicationFormValues) => {
    if (isEditing && publication) {
      const updateData: UpdatePublicationDto = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        status: data.status,
        isActive: data.isActive,
      };
      await updateMutation.mutateAsync({ id: publication.id, data: updateData });
    } else {
      const createData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        status: data.status || "PUBLISHED",
        isActive: data.isActive ?? true,
      };
      await createMutation.mutateAsync(createData);
    }

    onSuccess?.();
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
          placeholder="Enter publication name"
          {...register("name")}
          required
        />

        <CustomInput
          id="slug"
          label="Slug"
          placeholder="enter-publication-slug"
          {...register("slug")}
          required
        />
      </div>

      <CustomTextarea
        id="description"
        label="Description"
        placeholder="Publication description"
        {...register("description")}
      />

      <div className="space-y-2">
        <CustomInput
          id="logo"
          label="Logo URL"
          placeholder="https://example.com/logo.png"
          {...register("logo")}
        />
        <p className="text-xs text-muted-foreground">
          Enter a fully qualified URL for the publication logo
        </p>
      </div>

      <SearchableDropdown
        label="Status"
        items={BookStatusEnum.map((status) => ({
          id: status,
          label: status.charAt(0) + status.slice(1).toLowerCase(),
        }))}
        value={watch("status") || "PUBLISHED"}
        onChange={(item) => {
          if (item) setValue("status", item.id as BookStatus);
        }}
        placeholder="Select status"
      />

      <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isActive" className="text-base">
            Active Status
          </Label>
          <p className="text-sm text-muted-foreground">
            {watch("isActive") !== false
              ? "Publication is visible and active"
              : "Publication is hidden and inactive"}
          </p>
        </div>
        <Switch
          id="isActive"
          checked={watch("isActive") ?? true}
          onCheckedChange={(checked) => setValue("isActive", checked)}
        />
      </div>
    </form>
  );
}
