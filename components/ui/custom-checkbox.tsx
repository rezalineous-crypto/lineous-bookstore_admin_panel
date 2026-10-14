"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function CustomCheckbox({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}: CustomCheckboxProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "group relative flex h-5 w-5 shrink-0 items-center justify-center",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="peer sr-only"
        />

        {/* Box */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-md border-2 bg-white transition-all duration-200 ease-out",
            checked
              ? "scale-100 border-blue-600 bg-blue-600"
              : "scale-100 border-slate-300 group-hover:border-blue-400",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/20",
            "dark:border-slate-600 dark:bg-slate-900",
            checked && "dark:border-blue-500 dark:bg-blue-600",
            disabled && "opacity-60",
          )}
        />

        {/* Animated checkmark (draws in) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "pointer-events-none relative h-3.5 w-3.5 text-white transition-opacity duration-200 ease-out",
            checked ? "opacity-100" : "opacity-0",
          )}
        >
          <path
            d="M20 6L9 17l-5-5"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: checked ? 0 : 24,
              transition: "stroke-dashoffset 250ms ease-out",
            }}
          />
        </svg>
      </label>

      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "block cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomCheckbox;
