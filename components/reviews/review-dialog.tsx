"use client";

import { useState, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/ui/custom-modal";
import { ReviewForm } from "./review-form";
import type { Review } from "@/lib/types/book";

interface ReviewDialogProps {
  review?: Review | null;
  bookId?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReviewDialog({
  review,
  bookId,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: ReviewDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  const isEditing = Boolean(review);

  const formId = "review-form";

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  // Render the trigger by injecting an onClick handler directly onto the
  // provided element. This avoids wrapping it in an extra clickable node,
  // which would create nested interactive elements and a11y issues.
  const renderTrigger = () => {
    if (!trigger) return null;

    if (isValidElement(trigger)) {
      return cloneElement(trigger as ReactElement<{ onClick?: () => void }>, {
        onClick: () => setIsOpen(true),
      });
    }

    return trigger;
  };

  return (
    <>
      {renderTrigger()}

      <CustomModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title={isEditing ? "Edit review" : "Create a review"}
        description={
          isEditing
            ? "Update the review details and save your changes."
            : "Add a new review/testimonial for a book."
        }
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="min-w-24"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              type="submit"
              form={formId}
              disabled={isSubmitting}
              className="min-w-36"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {isEditing ? "Save changes" : "Create review"}
                </>
              )}
            </Button>
          </>
        }
      >
        <ReviewForm
          key={review?.id ?? `new-review-${bookId ?? "none"}`}
          review={review}
          bookId={bookId}
          formId={formId}
          onSubmittingChange={setIsSubmitting}
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </CustomModal>
    </>
  );
}
