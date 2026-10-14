"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";

export interface MultiSelectDropdownItem {
  id: number | string;
  label: string;
  subLabel?: string;
  [key: string]: unknown;
}

interface MultiSelectDropdownProps {
  items: MultiSelectDropdownItem[];
  value?: (number | string)[];
  onChange: (items: MultiSelectDropdownItem[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  renderItem?: (
    item: MultiSelectDropdownItem,
    isSelected: boolean
  ) => React.ReactNode;
  renderSelected?: (items: MultiSelectDropdownItem[]) => React.ReactNode;
  maxSelectedDisplay?: number;
  label?: string;
  required?: boolean;
}

export function MultiSelectDropdown({
  items,
  value = [],
  onChange,
  placeholder = "Select items",
  searchPlaceholder = "Search items...",
  loading = false,
  disabled = false,
  className = "",
  buttonClassName = "",
  renderItem,
  renderSelected,
  maxSelectedDisplay = 3,
  label,
  required = false,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const listId = `${generatedId}-list`;

  const selectedItems = items.filter((item) => value.includes(item.id));

  const isFloating = open || selectedItems.length > 0;

  const filteredItems = searchValue.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(searchValue.trim().toLowerCase())
      )
    : items;

  const closeDropdown = () => {
    if (!open || closing) return;

    setClosing(true);

    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setSearchValue("");
      closeTimerRef.current = null;
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || loading) return;

    const frame = requestAnimationFrame(() => {
      searchRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open, loading]);

  const openDropdown = () => {
    if (disabled) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setClosing(false);
    setOpen(true);
  };

  const toggleDropdown = () => {
    if (open) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const emitSelection = (nextValue: (number | string)[]) => {
    onChange(items.filter((item) => nextValue.includes(item.id)));
  };

  const handleToggle = (item: MultiSelectDropdownItem) => {
    const nextValue = value.includes(item.id)
      ? value.filter((id) => id !== item.id)
      : [...value, item.id];

    emitSelection(nextValue);
  };

  const handleRemove = (
    event: React.MouseEvent<HTMLButtonElement>,
    itemId: number | string
  ) => {
    event.stopPropagation();

    emitSelection(value.filter((id) => id !== itemId));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      {/* Control */}
      <div
        onClick={toggleDropdown}
        className={
          "relative h-12 rounded-lg border border-slate-300 bg-white " +
          "transition-all duration-200 ease-out " +
          (open
            ? "border-gray-500 ring-4 ring-gray-500/10 "
            : "border-slate-200 hover:border-slate-300 ") +
          (disabled
            ? "cursor-not-allowed bg-slate-50 opacity-60 "
            : "cursor-pointer ") +
          "dark:bg-slate-900 dark:border-slate-700 " +
          (open ? "dark:border-gray-400 " : "") +
          buttonClassName
        }
      >
        {label && (
          <label
            id={labelId}
            className={
              "pointer-events-none absolute left-3 z-10 " +
              "origin-left transition-all duration-200 ease-out " +
              (isFloating
                ? "-top-6 scale-90 text-sm " +
                  (open
                    ? "text-gray-600 font-bold dark:text-gray-400"
                    : "text-gray-600 font-bold")
                : "top-1/2 -translate-y-1/2 text-sm " +
                  "text-slate-500 dark:text-slate-400")
            }
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div
          className={
            "flex min-h-14 items-center gap-2 px-3 " +
            (label ? "pb-2" : "py-2")
          }
        >
          {/* Selected values */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedItems.length === 0 ? (
              <span
                className={
                  "truncate text-sm text-slate-400 " +
                  (label && !isFloating ? "invisible" : "")
                }
              >
                {placeholder}
              </span>
            ) : (
              <>
                {selectedItems.slice(0, maxSelectedDisplay).map((item) => (
                  <span
                    key={item.id}
                    className={
                      "inline-flex max-w-full items-center gap-1.5 " +
                      "rounded-md border border-gray-100 " +
                      "bg-gray-50 py-1 pl-2 pr-1 text-xs " +
                      "font-medium text-gray-700 " +
                      "animate-in fade-in zoom-in-95 duration-150 " +
                      "dark:border-gray-900 dark:bg-gray-950 " +
                      "dark:text-gray-300"
                    }
                  >
                    <span className="max-w-40 truncate">
                      {renderSelected ? renderSelected([item]) : item.label}
                    </span>

                    <button
                      type="button"
                      aria-label={`Remove ${item.label}`}
                      disabled={disabled}
                      onClick={(event) => handleRemove(event, item.id)}
                      className={
                        "flex h-5 w-5 shrink-0 items-center " +
                        "justify-center rounded transition-colors " +
                        "hover:bg-gray-200 hover:text-gray-900 " +
                        "focus-visible:outline-none " +
                        "focus-visible:ring-2 focus-visible:ring-gray-500 " +
                        "disabled:pointer-events-none " +
                        "dark:hover:bg-gray-900"
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {selectedItems.length > maxSelectedDisplay && (
                  <span
                    className={
                      "rounded-md bg-slate-100 px-2 py-1 " +
                      "text-xs font-medium text-slate-600 " +
                      "dark:bg-slate-800 dark:text-slate-300"
                    }
                  >
                    +{selectedItems.length - maxSelectedDisplay} more
                  </span>
                )}
              </>
            )}
          </div>

          {/* Native trigger button */}
          <button
            type="button"
            disabled={disabled}
            aria-label={label || placeholder}
            aria-expanded={open}
            aria-controls={listId}
            onClick={(event) => {
              event.stopPropagation();
              toggleDropdown();
            }}
            className={
              "flex h-8 w-8 shrink-0 items-center justify-center -mt-2" +
              "rounded-lg text-slate-400 transition-all duration-200 " +
              "hover:bg-slate-100 hover:text-slate-700 " +
              "focus-visible:outline-none focus-visible:ring-2 " +
              "focus-visible:ring-gray-500 " +
              "disabled:pointer-events-none " +
              "dark:hover:bg-slate-800 " +
              (open ? "rotate-180 text-gray-600 " : "")
            }
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Custom dropdown panel */}
      {open && (
        <div
          id={listId}
          className={
            "absolute left-0 right-0 top-full z-50 mt-2 " +
            "origin-top overflow-hidden rounded-xl " +
            "border border-slate-200 bg-white shadow-xl " +
            "shadow-slate-900/10 dark:border-slate-700 " +
            "dark:bg-slate-900 " +
            (closing
              ? "animate-out fade-out-0 zoom-out-95 duration-150"
              : "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200")
          }
        >
          {/* Search */}
          <div className="flex h-12 items-center gap-2 border-b border-slate-100 px-3 dark:border-slate-800">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder}
              disabled={disabled || loading}
              className={
                "h-full min-w-0 flex-1 bg-transparent text-sm " +
                "text-slate-800 outline-none placeholder:text-slate-400 " +
                "dark:text-slate-100"
              }
            />

            {searchValue && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchValue("")}
                className={
                  "flex h-7 w-7 items-center justify-center " +
                  "rounded-md text-slate-400 transition-colors " +
                  "hover:bg-slate-100 hover:text-slate-700 " +
                  "dark:hover:bg-slate-800"
                }
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[min(280px,40dvh)] overflow-y-auto p-1.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                Loading items...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <Search className="h-5 w-5 text-slate-300" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No items found
                </p>
                <p className="text-xs text-slate-400">
                  Try a different search term.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = value.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggle(item)}
                    className={
                      "group flex min-h-10 w-full items-center gap-2.5 " +
                      "rounded-lg px-2.5 py-2 text-left text-sm " +
                      "transition-colors duration-150 " +
                      (isSelected
                        ? "bg-gray-50/70 text-gray-700 " +
                          "dark:bg-gray-950/50 dark:text-gray-300 "
                        : "text-slate-700 hover:bg-slate-100 " +
                          "dark:text-slate-200 dark:hover:bg-slate-800")
                    }
                  >
                    <span
                      className={
                        "flex h-[18px] w-[18px] shrink-0 " +
                        "items-center justify-center rounded-md border " +
                        "transition-all duration-150 " +
                        (isSelected
                          ? "scale-100 border-gray-600 bg-gray-600 text-white"
                          : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900")
                      }
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 animate-in zoom-in-50 duration-150" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      {renderItem ? (
                        renderItem(item, isSelected)
                      ) : (
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate">{item.label}</span>

                          {item.subLabel && (
                            <span className="shrink-0 text-xs text-slate-400">
                              {item.subLabel}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Action footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60">
            <span className="text-xs text-slate-500">
              {selectedItems.length} selected
            </span>

            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleClear}
                  className={
                    "rounded-lg px-2.5 py-1.5 text-xs font-medium " +
                    "text-slate-500 transition-colors " +
                    "hover:bg-slate-200 hover:text-slate-900 " +
                    "disabled:opacity-50 dark:hover:bg-slate-800 " +
                    "dark:hover:text-slate-100"
                  }
                >
                  Clear all
                </button>
              )}

              <button
                type="button"
                onClick={closeDropdown}
                className={
                  "rounded-lg bg-gray-600 px-3.5 py-2 " +
                  "text-xs font-semibold text-white shadow-sm " +
                  "transition-all duration-150 hover:bg-gray-700 " +
                  "active:scale-[0.97] focus-visible:outline-none " +
                  "focus-visible:ring-2 focus-visible:ring-gray-500 " +
                  "focus-visible:ring-offset-2"
                }
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;
