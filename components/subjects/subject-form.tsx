"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { Switch } from "@/components/ui/switch";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { CustomInput } from "@/components/ui/custom-input";
import { CustomTextarea } from "@/components/ui/custom-text-area";
import { Label } from "@/components/ui/label";
import {
  useCreateSubject,
  useUpdateSubject,
} from "@/lib/hooks/use-subjects";
import { usePublications } from "@/lib/hooks/use-publications";
import type { Subject, UpdateSubjectDto } from "@/lib/types/book";
import { slugify } from "@/lib/utils";

type SubjectFormValues = {
  name: string;
  slug: string;
  description?: string;
  publicationId?: string;
  isActive?: boolean;
};

interface SubjectFormProps {
  subject?: Subject | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  onSubmittingChange?: (submitting: boolean) => void;
}

export function SubjectForm({
  subject,
  onSuccess,
  formId,
  onSubmittingChange,
}: SubjectFormProps) {
  const isEditing = !!subject;

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const { data: publications = [] } = usePublications();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Report the mutation's pending state so the modal footer can reflect it.
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const { register, handleSubmit, setValue, watch } = useForm<SubjectFormValues>({
    defaultValues: {
      name: subject?.name || "",
      slug: subject?.slug || "",
      description: subject?.description || "",
      publicationId: subject?.publicationId || "",
      isActive: subject?.isActive ?? true,
    },
  });

  // Auto-generate slug from name
  const nameValue = watch("name");
  useEffect(() => {
    if (!isEditing) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, isEditing, setValue]);

  const onSubmit = async (data: SubjectFormValues) => {
    if (isEditing && subject) {
      const updateData: UpdateSubjectDto = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        publicationId: data.publicationId,
        isActive: data.isActive,
      };
      await updateMutation.mutateAsync({ id: subject.id, data: updateData });
    } else {
      await createMutation.mutateAsync(data);
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
          placeholder="Enter subject name"
          {...register("name")}
          required
        />

        <CustomInput
          id="slug"
          label="Slug"
          placeholder="enter-subject-slug"
          {...register("slug")}
          required
        />
      </div>

      <CustomTextarea
        id="description"
        label="Description"
        placeholder="Subject description"
        {...register("description")}
      />

      <div className="space-y-2">
        <SearchableDropdown
          label="Publication"
          items={publications.map((pub) => ({ id: pub.id, label: pub.name }))}
          value={watch("publicationId") || ""}
          onChange={(item) => {
            if (item) setValue("publicationId", String(item.id) || undefined);
          }}
          placeholder="Select publication (optional)"
        />
        <p className="text-xs text-muted-foreground">
          Optionally link this subject to a publication
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isActive" className="text-base">
            Active Status
          </Label>
          <p className="text-sm text-muted-foreground">
            {watch("isActive") !== false
              ? "Subject is visible and active"
              : "Subject is hidden and inactive"}
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
