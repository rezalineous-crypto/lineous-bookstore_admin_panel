"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
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
}

export function SubjectForm({ subject, onSuccess, onCancel }: SubjectFormProps) {
  const isEditing = !!subject;

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const { data: publications = [] } = usePublications();

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter subject name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register("slug")}
            placeholder="enter-subject-slug"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Subject description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publicationId">Publication</Label>
        <SearchableDropdown
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
            ? "Update Subject"
            : "Create Subject"}
        </Button>
      </div>
    </form>
  );
}
