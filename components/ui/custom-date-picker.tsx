"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  id?: string;
  label?: string;
  /** Value in "YYYY-MM-DD" format. */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  className?: string;
  wrapperClassName?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(value?: string): Date | null {
  if (!value) return null;
  const datePart = value.slice(0, 10); // handles "YYYY-MM-DD" and full ISO strings
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(value?: string): string {
  const date = parseDateValue(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomDatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  required = false,
  description,
  className = "",
  wrapperClassName = "",
}: CustomDatePickerProps) {
  const generatedId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);

  const selectedDate = parseDateValue(value);
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState<Date>(
    () => selectedDate || new Date()
  );

  const isFloating = open || !!selectedDate;

  // Close on outside click / Escape
  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayValue = toDateValue(new Date());

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToPrevYear = () => setViewDate(new Date(year - 1, month, 1));
  const goToNextYear = () => setViewDate(new Date(year + 1, month, 1));

  const handleToggle = () => {
    if (disabled) return;
    if (!open && selectedDate) {
      setViewDate(new Date(selectedDate));
    }
    setOpen((prev) => !prev);
  };

  const handleSelect = (day: number) => {
    onChange(toDateValue(new Date(year, month, day)));
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onChange(toDateValue(now));
    setOpen(false);
  };

  // Build the day cells (leading blanks + month days)
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      ref={rootRef}
      id={id}
      className={cn("relative w-full", wrapperClassName)}
    >
      {/* Control */}
      <div
        onClick={handleToggle}
        className={cn(
          "relative flex h-12 w-full cursor-pointer items-center rounded-lg border border-slate-300 bg-white transition-all duration-200 ease-out",
          "hover:border-slate-400",
          open && "border-gray-500 ring-4 ring-gray-500/10",
          disabled && "cursor-not-allowed bg-slate-50 opacity-60",
          "dark:border-slate-700 dark:bg-slate-900",
          className
        )}
      >
        {label && (
          <label
            className={cn(
              "pointer-events-none absolute z-10 origin-left transition-all duration-200 ease-out",
              isFloating
                ? "left-3 -top-6 scale-90 text-sm font-bold text-gray-600 dark:text-gray-400"
                : "left-9 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400"
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="flex w-full items-center gap-2 px-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

          <span
            className={cn(
              "flex-1 truncate text-sm",
              selectedDate ? "text-slate-900" : "text-slate-400",
              label && !isFloating && "invisible"
            )}
          >
            {selectedDate ? formatDisplay(value) : placeholder}
          </span>

          {selectedDate && !disabled && (
            <button
              type="button"
              aria-label="Clear date"
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
      </div>

      {description && (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}

      {/* Calendar panel */}
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
            "dark:border-slate-700 dark:bg-slate-900"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-1 border-b border-slate-100 px-2 py-2 dark:border-slate-800">
            <button
              type="button"
              aria-label="Previous year"
              onClick={goToPrevYear}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Previous month"
              onClick={goToPrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex-1 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
              {MONTHS[month]} {year}
            </div>

            <button
              type="button"
              aria-label="Next month"
              onClick={goToNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next year"
              onClick={goToNextYear}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 px-2 pt-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-xs font-medium text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1 px-2 pb-2">
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-9" />;
              }

              const dateValue = toDateValue(new Date(year, month, day));
              const isSelected = value === dateValue;
              const isToday = todayValue === dateValue;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                    isSelected
                      ? "bg-gray-600 font-semibold text-white"
                      : isToday
                        ? "font-semibold text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/50"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="rounded-lg bg-gray-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-gray-700 active:scale-[0.97]"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDatePicker;
