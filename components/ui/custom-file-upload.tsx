"use client";

import * as React from "react";
import { ImageUp, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface CustomFileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  buttonText?: string;
  previewUrl?: string | null;
  previewLabel?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
  wrapperClassName?: string;
}

export function CustomFileUpload({
  id,
  label,
  accept,
  multiple = false,
  disabled = false,
  required = false,
  description,
  buttonText = "Choose file",
  previewUrl,
  previewLabel,
  onChange,
  onClear,
  className = "",
  wrapperClassName = "",
}: CustomFileUploadProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const isFloating = !!fileName || !!previewUrl;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : null);
    onChange?.(event);
  };

  const handleClear = () => {
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClear?.();
  };

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {/* Control */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex h-12 w-full cursor-pointer items-center rounded-lg border border-slate-300 bg-white transition-all duration-200 ease-out",
          "focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10",
          "hover:border-slate-400",
          disabled && "cursor-not-allowed bg-slate-50 opacity-60",
          "dark:border-slate-700 dark:bg-slate-900",
          className
        )}
      >
        {label && (
          <label
            className={cn(
              "pointer-events-none absolute left-3 z-10 origin-left transition-all duration-200 ease-out",
              isFloating
                ? "-top-6 scale-90 text-sm font-bold text-blue-600 dark:text-blue-400"
                : "top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400"
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="flex w-full items-center gap-2 px-3">
          <ImageUp className="h-4 w-4 shrink-0 text-slate-400" />

          <span
            className={cn(
              "flex-1 truncate text-sm lg:ml-5",
              fileName ? "text-slate-900" : "text-slate-400",
              label && !isFloating && "invisible"
            )}
          >
            {fileName || buttonText}
          </span>

          {(fileName || previewUrl) && !disabled && (
            <button
              type="button"
              aria-label="Clear file"
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors",
                "hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
      </div>

      {description && (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}

      {/* Optional preview */}
      {previewUrl && (
        <div className="mt-3 flex items-center gap-4">
          <img
            src={previewUrl}
            alt={previewLabel || "Preview"}
            className="h-32 w-24 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          />
          {previewLabel && (
            <p className="text-sm text-muted-foreground">{previewLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomFileUpload;
