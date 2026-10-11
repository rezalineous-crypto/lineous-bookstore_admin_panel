"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
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
}

export function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter book title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="enter-book-slug"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
            {...register("shortDescription")}
            placeholder="Brief description of the book"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Full book description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="publicationDate">Publication Date</Label>
            <Input
              id="publicationDate"
              type="date"
              {...register("publicationDate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edition">Edition</Label>
            <Input
              id="edition"
              {...register("edition")}
              placeholder="1st Edition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              {...register("language")}
              placeholder="English"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="publicationId">Publication *</Label>
            <SearchableDropdown
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectId">Subject *</Label>
            <SearchableDropdown
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

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <SearchableDropdown
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryIds">Categories</Label>
          <MultiSelectDropdown
            items={categories.map((cat) => ({
              id: cat.id,
              label: cat.name,
              subLabel: cat.isHidden ? "Hidden" : undefined,
            }))}
            value={watch("categoryIds") || []}
            onChange={(items) => {
              setValue(
                "categoryIds",
                items.map((i) => String(i.id))
              );
            }}
            placeholder="Select categories (optional)"
            renderItem={(item, isSelected) => (
              <>
                <span className="flex-1">{item.label}</span>
                {item.subLabel && (
                  <span className="text-xs text-slate-400 ml-2">
                    {item.subLabel}
                  </span>
                )}
              </>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Select one or more categories. Hidden categories are included.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail (Book Cover)</Label>
          <Input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
          {(thumbnailPreview || (book?.thumbnail && !thumbnailFile)) && (
            <div className="mt-2">
              <p className="mb-1 text-sm text-muted-foreground">
                {thumbnailFile
                  ? "New Thumbnail Preview:"
                  : "Current Thumbnail:"}
              </p>
              <img
                src={thumbnailPreview || book?.thumbnail}
                alt={thumbnailFile ? "Thumbnail preview" : "Current thumbnail"}
                className="h-32 w-24 rounded-md object-cover"
              />
            </div>
          )}
        </div>

        {/* <div className="space-y-2">
        <Label htmlFor="attachments">Additional Attachments</Label>
        <Input
          id="attachments"
          type="file"
          accept="image/*"
          multiple
          onChange={handleAttachmentsChange}
        />
        {attachmentFiles.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {attachmentFiles.length} file(s) selected
          </p>
        )}
      </div> */}

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
              ? "Update Book"
              : "Create Book"}
          </Button>
        </div>
      </form>
      {renderInlineDialogs()}
    </>
  );
}
