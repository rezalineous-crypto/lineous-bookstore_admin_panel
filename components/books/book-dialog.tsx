"use client";

import { useState, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/ui/custom-modal";
import { BookForm } from "./book-form";
import type { Book } from "@/lib/types/book";

interface BookDialogProps {
  book?: Book | null;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  onBookCreated?: (bookId: string) => void;
}

export function BookDialog({
  book,
  trigger,
  open,
  onOpenChange,
  onSuccess,
  onBookCreated,
}: BookDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  const isEditing = Boolean(book);

  const formId = "book-form";

  const handleSuccess = (createdBookId?: string) => {
    setIsOpen(false);

    if (createdBookId && onBookCreated) {
      onBookCreated(createdBookId);
    }

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
        title={isEditing ? "Edit book" : "Create a book"}
        description={
          isEditing
            ? "Update the book details and save your changes."
            : "Add a new book to your inventory by completing the details below."
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
                  {isEditing ? "Save changes" : "Create book"}
                </>
              )}
            </Button>
          </>
        }
      >
        <BookForm
          key={book?.id ?? "new-book"}
          book={book}
          formId={formId}
          onSubmittingChange={setIsSubmitting}
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </CustomModal>
    </>
  );
}
