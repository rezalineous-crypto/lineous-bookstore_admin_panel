"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect, type ChangeEvent, type ReactNode } from "react";
import {
  Building2,
  Image as ImageIcon,
  Info,
  Tags,
  type LucideIcon,
} from "lucide-react";

import { CustomInput } from "@/components/ui/custom-input";
import { CustomTextarea } from "@/components/ui/custom-text-area";
import { CustomFileUpload } from "@/components/ui/custom-file-upload";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { cn, slugify } from "@/lib/utils";
import {
  useCreateBook,
  useUpdateBook,
  usePublications,
  useSubjects,
} from "@/lib/hooks/use-books";
import { useCategories } from "@/lib/hooks/use-categories";
import { PublicationDialog } from "@/components/publications/publication-dialog";
import { SubjectDialog } from "@/components/subjects/subject-dialog";
import type {
  Book,
  UpdateBookDto,
  BookStatus,
  Category,
} from "@/lib/types/book";

type BookFormValues = {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  publicationDate?: string;
  edition?: string;
  language?: string;
  status?: BookStatus;
  publicationId: string;
  subjectId: string;
  categoryIds: string[];
};

interface BookFormProps {
  book?: Book | null;
  onSuccess?: (bookId?: string) => void;
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
    <section className="rounded-xl border border-border/70 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/70 pb-8">
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

export function BookForm({
  book,
  onSuccess,
  formId,
  onSubmittingChange,
}: BookFormProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isPublicationDialogOpen, setIsPublicationDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const isEditing = !!book;

  // Create preview URL for selected thumbnail
  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setThumbnailPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setThumbnailPreview(null);
  }, [thumbnailFile]);

  // Store original values to detect changes
  const originalValues = book
    ? {
        title: book.title,
        slug: book.slug,
        shortDescription: book.shortDescription || "",
        description: book.description || "",
        publicationDate: book.publicationDate || "",
        edition: book.edition || "",
        language: book.language || "",
        status: book.status as BookStatus,
        publicationId: book.publicationId || "",
        subjectId: book.subjectId || "",
        categoryIds: book.categoryIds || [],
        thumbnail: book.thumbnail || "",
      }
    : null;

  const { data: publications = [] } = usePublications();
  const { data: subjects = [] } = useSubjects();
  const { data: categories = [] } = useCategories();

  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Report the mutation's pending state so the modal footer can reflect it.
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const { register, handleSubmit, setValue, watch } = useForm<BookFormValues>({
    defaultValues: {
      title: book?.title || "",
      slug: book?.slug || "",
      shortDescription: book?.shortDescription || "",
      description: book?.description || "",
      publicationDate: book?.publicationDate || "",
      edition: book?.edition || "",
      language: book?.language || "",
      status: (book?.status as BookStatus) || "DRAFT",
      publicationId: book?.publicationId || "",
      subjectId: book?.subjectId || "",
      categoryIds: book?.categoryIds || [],
    },
  });

  // Auto-generate slug from title
  const titleValue = watch("title");
  useEffect(() => {
    if (!isEditing) {
      setValue("slug", slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isEditing, setValue]);

  const selectedPublicationId = watch("publicationId");

  // Filter subjects by selected publication
  const filteredSubjects = selectedPublicationId
    ? subjects.filter(
        (subject) => subject.publicationId === selectedPublicationId
      )
    : subjects;

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleAttachmentsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachmentFiles((prev) => [...prev, ...files]);
  };

  const buildPartialUpdate = (
    data: BookFormValues
  ): { data: UpdateBookDto | FormData; hasFiles: boolean } => {
    const hasFiles = !!thumbnailFile || attachmentFiles.length > 0;
    const changes: Record<string, unknown> = {};

    // Compare each field with original value and only include if changed
    if (data.title !== originalValues?.title) changes.title = data.title;
    if (data.slug !== originalValues?.slug) changes.slug = data.slug;
    if (data.shortDescription !== originalValues?.shortDescription)
      changes.shortDescription = data.shortDescription;
    if (data.description !== originalValues?.description)
      changes.description = data.description;
    if (data.publicationDate !== originalValues?.publicationDate)
      changes.publicationDate = data.publicationDate;
    if (data.edition !== originalValues?.edition)
      changes.edition = data.edition;
    if (data.language !== originalValues?.language)
      changes.language = data.language;
    if (data.status !== originalValues?.status) changes.status = data.status;
    if (data.publicationId !== originalValues?.publicationId)
      changes.publicationId = data.publicationId;
    if (data.subjectId !== originalValues?.subjectId)
      changes.subjectId = data.subjectId;
    if (
      JSON.stringify(data.categoryIds) !==
      JSON.stringify(originalValues?.categoryIds)
    )
      changes.categoryIds = data.categoryIds;

    if (hasFiles) {
      // Use FormData when files are involved
      const formData = new FormData();
      Object.entries(changes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "categoryIds" && Array.isArray(value)) {
            value.forEach((catId) => {
              formData.append("categoryIds[]", String(catId));
            });
          } else {
            formData.append(key, String(value));
          }
        }
      });
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
      attachmentFiles.forEach((file) => {
        formData.append("attachments", file);
      });
      return { data: formData, hasFiles: true };
    }

    return { data: changes as UpdateBookDto, hasFiles: false };
  };

  const onSubmit = async (data: BookFormValues) => {
    if (isEditing && book) {
      const { data: updateData, hasFiles } = buildPartialUpdate(data);
      await updateMutation.mutateAsync({ id: book.id, data: updateData });
      onSuccess?.();
    } else {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("slug", data.slug);
      if (data.shortDescription)
        formData.append("shortDescription", data.shortDescription);
      if (data.description) formData.append("description", data.description);
      if (data.publicationDate)
        formData.append("publicationDate", data.publicationDate);
      if (data.edition) formData.append("edition", data.edition);
      if (data.language) formData.append("language", data.language);
      formData.append("status", data.status || "DRAFT");
      formData.append("publicationId", data.publicationId);
      formData.append("subjectId", data.subjectId);
      data.categoryIds.forEach((catId) => {
        formData.append("categoryIds[]", catId);
      });

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      attachmentFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      const result = await createMutation.mutateAsync(formData);
      onSuccess?.(result.data.id);
    }
  };

  // Render inline dialogs outside the form content
  const renderInlineDialogs = () => (
    <>
      <PublicationDialog
        open={isPublicationDialogOpen}
        onOpenChange={setIsPublicationDialogOpen}
      />
      <SubjectDialog
        open={isSubjectDialogOpen}
        onOpenChange={setIsSubjectDialogOpen}
      />
    </>
  );

  return (
    <>
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 01 — Basic information */}
        <FormSection
          icon={Info}
          iconClassName="bg-blue-500/10 text-blue-600"
          title="Basic information"
          // description="The essential details used to identify this book."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <CustomInput
              id="title"
              label="Book title"
              placeholder="e.g. The Art of Programming"
              {...register("title")}
              required
            />

            <CustomInput
              id="slug"
              label="Slug"
              placeholder="enter-book-slug"
              {...register("slug")}
              required
            />
          </div>

          <MultiSelectDropdown
            label="Categories"
            items={categories.map((cat) => ({
              id: cat.id,
              label: cat.name,
              subLabel: cat.isHidden ? "Hidden" : undefined,
            }))}
            value={watch("categoryIds") || []}
            onChange={(items) => {
              setValue(
                "categoryIds",
                items.map((item) => String(item.id))
              );
            }}
            placeholder="Select categories"
            searchPlaceholder="Search categories..."
            required
            className="mt-10"
          />

          <CustomTextarea
            id="shortDescription"
            label="Short description"
            placeholder="Brief description of the book"
            {...register("shortDescription")}
          />

          <CustomTextarea
            id="description"
            label="Description"
            placeholder="Full book description"
            {...register("description")}
          />
        </FormSection>

        {/* 02 — Publication details */}
        <FormSection
          icon={Building2}
          iconClassName="bg-violet-500/10 text-violet-600"
          title="Publication details"
          // description="Where and when this book was published."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-10">
            <SearchableDropdown
              label="Publication"
              required
              items={publications.map((pub) => ({
                id: pub.id,
                label: pub.name,
              }))}
              value={watch("publicationId") || ""}
              onChange={(item) => {
                if (item) {
                  setValue("publicationId", String(item.id));
                  setValue("subjectId", "");
                }
              }}
              placeholder="Select publication"
              onAddNewClick={() => setIsPublicationDialogOpen(true)}
              addNewLabel="Publication"
            />

            <div className="space-y-2">
              <SearchableDropdown
                label="Subject"
                required
                items={filteredSubjects.map((subject) => ({
                  id: subject.id,
                  label: subject.name,
                }))}
                value={watch("subjectId") || ""}
                onChange={(item) => {
                  if (item) setValue("subjectId", String(item.id));
                }}
                placeholder={
                  selectedPublicationId
                    ? "Select subject"
                    : "Select publication first"
                }
                disabled={!selectedPublicationId}
                onAddNewClick={() => setIsSubjectDialogOpen(true)}
                addNewLabel="Subject"
              />
              {!selectedPublicationId && (
                <p className="text-xs text-muted-foreground">
                  Please select a publication first
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <CustomInput
              id="edition"
              label="Edition"
              placeholder="1st Edition"
              {...register("edition")}
            />

            <CustomDatePicker
              label="Publication date"
              value={watch("publicationDate") || ""}
              onChange={(date) =>
                setValue("publicationDate", date, { shouldValidate: true })
              }
            />
          </div>
        </FormSection>

        {/* 03 — Classification */}
        <FormSection
          icon={Tags}
          iconClassName="bg-amber-500/10 text-amber-600"
          title="Classification"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SearchableDropdown
              label="Status"
              items={[
                { id: "DRAFT", label: "Draft" },
                { id: "PUBLISHED", label: "Published" },
                { id: "ARCHIVED", label: "Archived" },
              ]}
              value={watch("status") || "DRAFT"}
              onChange={(item) => {
                if (item) setValue("status", item.id as BookStatus);
              }}
              placeholder="Select status"
            />

            <CustomInput
              id="language"
              label="Language"
              placeholder="English"
              {...register("language")}
            />
          </div>
        </FormSection>

        {/* 04 — Book cover */}
        <FormSection
          icon={ImageIcon}
          iconClassName="bg-emerald-500/10 text-emerald-600"
          title="Book cover"
        >
          <CustomFileUpload
            label="Thumbnail"
            accept="image/*"
            buttonText="Choose image"
            description="Recommended size: 400×600px. PNG, JPG, or WEBP."
            previewUrl={thumbnailPreview || book?.thumbnail || null}
            previewLabel={
              thumbnailFile ? "New thumbnail preview" : "Current thumbnail"
            }
            onChange={handleThumbnailChange}
            onClear={() => setThumbnailFile(null)}
          />
        </FormSection>
      </form>
      {renderInlineDialogs()}
    </>
  );
}
