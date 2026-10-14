"use client";

import { useState, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/ui/custom-modal";
import { PublicationForm } from "./publication-form";
import type { Publication } from "@/lib/types/book";

interface PublicationDialogProps {
  publication?: Publication | null;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PublicationDialog({
  publication,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: PublicationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  const isEditing = Boolean(publication);

  const formId = "publication-form";

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
        title={isEditing ? "Edit publication" : "Create a publication"}
        description={
          isEditing
            ? "Update the publication details and save your changes."
            : "Add a new publication to your bookstore catalog."
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
                  {isEditing ? "Save changes" : "Create publication"}
                </>
              )}
            </Button>
          </>
        }
      >
        <PublicationForm
          key={publication?.id ?? "new-publication"}
          publication={publication}
          formId={formId}
          onSubmittingChange={setIsSubmitting}
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </CustomModal>
    </>
  );
}
