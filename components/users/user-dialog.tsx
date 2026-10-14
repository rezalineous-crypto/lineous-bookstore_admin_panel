"use client";

import { useState, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomModal } from "@/components/ui/custom-modal";
import { UserForm } from "./user-form";
import type { User } from "@/lib/types/book";

interface UserDialogProps {
  user?: User | null;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UserDialog({
  user,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: UserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  const isEditing = Boolean(user);

  const formId = "user-form";

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
        title={isEditing ? "Edit user" : "Create a user"}
        description={
          isEditing
            ? "Update the user details and save your changes."
            : "Add a new user to your bookstore admin panel."
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
                  {isEditing ? "Save changes" : "Create user"}
                </>
              )}
            </Button>
          </>
        }
      >
        <UserForm
          key={user?.id ?? "new-user"}
          user={user}
          formId={formId}
          onSubmittingChange={setIsSubmitting}
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </CustomModal>
    </>
  );
}
