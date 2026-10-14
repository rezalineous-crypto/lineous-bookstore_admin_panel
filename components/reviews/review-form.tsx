"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { CustomInput } from "@/components/ui/custom-input";
import { CustomTextarea } from "@/components/ui/custom-text-area";
import {
  useCreateReview,
  useUpdateReview,
} from "@/lib/hooks/use-reviews";
import type { Review, UpdateReviewDto } from "@/lib/types/book";

type ReviewFormValues = {
  bookId: string;
  reviewerName: string;
  designation?: string;
  rating: number;
  comment?: string;
  displayOrder?: number;
};

interface ReviewFormProps {
  review?: Review | null;
  bookId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  onSubmittingChange?: (submitting: boolean) => void;
}

export function ReviewForm({
  review,
  bookId,
  onSuccess,
  formId,
  onSubmittingChange,
}: ReviewFormProps) {
  const isEditing = !!review;

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Report the mutation's pending state so the modal footer can reflect it.
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const { register, handleSubmit, setValue, watch } = useForm<ReviewFormValues>({
    defaultValues: {
      bookId: review?.bookId || bookId || "",
      reviewerName: review?.reviewerName || "",
      designation: review?.designation || "",
      rating: review?.rating || 5,
      comment: review?.comment || "",
      displayOrder: review?.displayOrder ?? 0,
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    if (isEditing && review) {
      const updateData: UpdateReviewDto = {
        reviewerName: data.reviewerName,
        designation: data.designation,
        rating: data.rating,
        comment: data.comment,
        displayOrder: data.displayOrder,
      };
      await updateMutation.mutateAsync({ id: review.id, data: updateData });
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
      {!bookId && (
        <CustomInput
          id="bookId"
          label="Book ID"
          placeholder="Enter book ID"
          {...register("bookId")}
          required
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInput
          id="reviewerName"
          label="Reviewer Name"
          placeholder="Enter reviewer name"
          {...register("reviewerName")}
          required
        />

        <CustomInput
          id="designation"
          label="Designation"
          placeholder="e.g. Professor, Senior Editor"
          {...register("designation")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInput
          id="rating"
          label="Rating"
          type="number"
          min={1}
          max={5}
          placeholder="1-5"
          {...register("rating", { valueAsNumber: true })}
          required
        />

        <CustomInput
          id="displayOrder"
          label="Display Order"
          type="number"
          placeholder="0"
          {...register("displayOrder", { valueAsNumber: true })}
        />
      </div>

      <CustomTextarea
        id="comment"
        label="Comment"
        placeholder="Review comment/testimonial"
        rows={4}
        {...register("comment")}
      />
    </form>
  );
}
