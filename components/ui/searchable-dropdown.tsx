"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";

export interface SearchableDropdownItem {
  id: number | string;
  label: string;
  subLabel?: string;
  [key: string]: unknown;
}

interface SearchableDropdownProps {
  items: SearchableDropdownItem[];
  value?: number | string | null;
  onChange: (item: SearchableDropdownItem | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  enableAddNew?: boolean;
  addNewLabel?: string;
  addNewEndpoint?: string;
  addNewPayloadBuilder?: (searchValue: string) => Record<string, unknown>;
  onAddNewSuccess?: (newItem: SearchableDropdownItem) => void;
  onAddNewClick?: () => void;
  renderItem?: (
    item: SearchableDropdownItem,
    isSelected: boolean
  ) => React.ReactNode;
  renderSelected?: (item: SearchableDropdownItem) => React.ReactNode;
  label?: string;
  required?: boolean;
}

export function SearchableDropdown({
  items,
  value,
  onChange,
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  loading = false,
  disabled = false,
  className = "",
  buttonClassName = "",
  enableAddNew = false,
  addNewLabel = "Add New",
  addNewEndpoint,
  addNewPayloadBuilder,
  onAddNewSuccess,
  onAddNewClick,
  renderItem,
  renderSelected,
  label,
  required = false,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generatedId = useId();
  const listId = `${generatedId}-list`;

  const selectedItem =
    items.find((item) => item.id === value) ||
    (value ? { id: value, label: String(value) } : null);

  const isFloating = open || !!selectedItem;

  const filteredItems = searchValue.trim()
    ? items.filter((item) =>
        item?.label?.toLowerCase().includes(searchValue.trim().toLowerCase())
      )
    : items;

  const closeDropdown = () => {
    if (!open || closing) return;

    setClosing(true);

    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setSearchValue("");
      setIsCreating(false);
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

  const handleSelect = (item: SearchableDropdownItem) => {
    onChange(item);
    closeDropdown();
  };

  const handleAddNew = async () => {
    if (!addNewEndpoint || !addNewPayloadBuilder || !searchValue.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const payload = addNewPayloadBuilder(searchValue.trim());
      const res = await apiClient.post(addNewEndpoint, payload);

      toast.success(`${addNewLabel} created successfully`, {
        className: "bg-emerald-600 text-white",
      });

      const newItem: SearchableDropdownItem = {
        id: res.data?.id || Date.now(),
        label:
          res.data?.supplier_name ||
          res.data?.item_name ||
          searchValue.trim(),
        subLabel: res.data?.category_name || res.data?.supplier_type,
        ...res.data,
      };

      onAddNewSuccess?.(newItem);
      onChange(newItem);
      closeDropdown();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message ||
          `Failed to create ${addNewLabel.toLowerCase()}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const hasNoResults = searchValue.trim() && filteredItems.length === 0;

  const showAddNewOption =
    enableAddNew && hasNoResults && !loading && !isCreating;

  const showCreateButton = onAddNewClick && !loading;

  const showEmptyState =
    !loading && filteredItems.length === 0 && !showAddNewOption && !showCreateButton;

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
            "flex min-h-14 items-center gap-2 px-3 " + (label ? "pb-2" : "py-2")
          }
        >
          {/* Selected value */}
          <div className="flex min-w-0 flex-1 items-center">
            {!selectedItem ? (
              <span
                className={
                  "truncate text-sm text-slate-400 " +
                  (label && !isFloating ? "invisible" : "")
                }
              >
                {placeholder}
              </span>
            ) : (
              <span className="truncate text-sm text-slate-900">
                {renderSelected ? renderSelected(selectedItem) : selectedItem.label}
              </span>
            )}
          </div>

          {/* Trigger button */}
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
              "flex h-8 w-8 shrink-0 items-center justify-center " +
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
            ) : showEmptyState ? (
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
              <>
                {showCreateButton && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onAddNewClick?.();
                    }}
                    className={
                      "group flex min-h-10 w-full items-center gap-2.5 " +
                      "rounded-lg px-2.5 py-2 text-left text-sm " +
                      "text-gray-700 transition-colors duration-150 " +
                      "hover:bg-gray-50 dark:text-gray-300 " +
                      "dark:hover:bg-gray-950/50"
                    }
                  >
                    <span
                      className={
                        "flex h-[18px] w-[18px] shrink-0 items-center " +
                        "justify-center rounded-md border border-gray-300 " +
                        "bg-white dark:border-gray-600 dark:bg-slate-900"
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </span>
                    <span className="min-w-0 flex-1 font-medium">
                      Add {addNewLabel}
                    </span>
                  </button>
                )}

                {showAddNewOption && (
                  <button
                    type="button"
                    onClick={handleAddNew}
                    className={
                      "group flex min-h-10 w-full items-center gap-2.5 " +
                      "rounded-lg px-2.5 py-2 text-left text-sm " +
                      "text-emerald-700 transition-colors duration-150 " +
                      "hover:bg-emerald-50 dark:text-emerald-300 " +
                      "dark:hover:bg-emerald-950/50"
                    }
                  >
                    <span
                      className={
                        "flex h-[18px] w-[18px] shrink-0 items-center " +
                        "justify-center rounded-md border border-emerald-300 " +
                        "bg-white dark:border-emerald-600 dark:bg-slate-900"
                      }
                    >
                      {isCreating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">
                      + Add &quot;{searchValue.trim()}&quot;
                    </span>
                  </button>
                )}

                {filteredItems.map((item) => {
                  const isSelected = value === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
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
                })}
              </>
            )}
          </div>

          {/* Action footer */}
          {/* <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60">
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
          </div> */}
        </div>
      )}
    </div>
  );
}

export default SearchableDropdown;
