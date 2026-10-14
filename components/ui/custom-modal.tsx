"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CustomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function CustomModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = "",
}: CustomModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-0 backdrop-blur-[3px] sm:p-4 md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-modal-title"
        aria-describedby={description ? "custom-modal-description" : undefined}
        className={`flex h-dvh w-full flex-col overflow-hidden bg-background shadow-2xl sm:h-auto sm:max-h-[min(90dvh,900px)] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-border/70 ${className}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Fixed header */}
        <header className="relative flex shrink-0 items-start justify-between gap-4 border-b border-border/70 bg-background px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0 space-y-1.5">
            <h2
              id="custom-modal-title"
              className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              {title}
            </h2>

            {description && (
              <p
                id="custom-modal-description"
                className="max-w-2xl text-sm leading-6 text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Close modal"
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* The only scrollable area */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:py-7 md:py-0 sm:px-7">
          {children}
        </div>

        {/* Fixed footer */}
        {footer && (
          <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-border/70 bg-background px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  );
}
