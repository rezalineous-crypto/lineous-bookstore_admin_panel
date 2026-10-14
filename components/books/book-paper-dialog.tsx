"use client";

import { useState, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/ui/custom-modal";
import { BookPaperForm } from "./book-paper-form";
import type { BookPaper } from "@/lib/types/book";

interface BookPaperDialogProps {
  bookId: string;
  paper?: BookPaper | null;
  trigger?: ReactNode;
  onSuccess?: () => void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookPaperDialog({ bookId, paper, trigger, onSuccess, onCancel, open, onOpenChange }: BookPaperDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;
  const isEditing = Boolean(paper);

  const formId = "book-paper-form";

  const handleSuccess = () => {
    setDialogOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setDialogOpen(false);
    onCancel?.();
  };

  // Render the trigger by injecting an onClick handler directly onto the
  // provided element. This avoids wrapping it in an extra clickable node,
  // which would create nested interactive elements and a11y issues.
  const renderTrigger = () => {
    if (!trigger) return null;

    if (isValidElement(trigger)) {
      return cloneElement(trigger as ReactElement<{ onClick?: () => void }>, {
        onClick: () => setDialogOpen(true),
      });
    }

    return trigger;
  };

  return (
    <>
      {renderTrigger()}

      <CustomModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={isEditing ? "Edit paper" : "Add new paper"}
        description={
          isEditing
            ? "Update the paper variant details below."
            : "Create a new paper variant for this book. A book must have at least one paper to be sellable."
        }
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
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
                  {isEditing ? "Save changes" : "Create paper"}
                </>
              )}
            </Button>
          </>
        }
      >
        <BookPaperForm
          key={paper?.id ?? `new-paper-${bookId}`}
          bookId={bookId}
          paper={paper}
          formId={formId}
          onSubmittingChange={setIsSubmitting}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </CustomModal>
    </>
  );
}
