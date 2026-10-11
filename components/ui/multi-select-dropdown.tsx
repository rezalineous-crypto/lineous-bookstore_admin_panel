"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  renderItem?: (item: MultiSelectDropdownItem, isSelected: boolean) => React.ReactNode;
  renderSelected?: (items: MultiSelectDropdownItem[]) => React.ReactNode;
  maxSelectedDisplay?: number;
}

export function MultiSelectDropdown({
  items,
  value = [],
  onChange,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  loading = false,
  disabled = false,
  className,
  buttonClassName,
  renderItem,
  renderSelected,
  maxSelectedDisplay = 3,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const filteredItems = searchValue.trim()
    ? items.filter((item) =>
        item?.label?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : items;

  const selectedItems = items.filter((item) => value.includes(item.id));

  const handleToggle = (item: MultiSelectDropdownItem) => {
    const newValue = value.includes(item.id)
      ? value.filter((v) => v !== item.id)
      : [...value, item.id];
    const newItems = items.filter((i) => newValue.includes(i.id));
    onChange(newItems);
  };

  const handleRemove = (itemId: number | string) => {
    const newValue = value.filter((v) => v !== itemId);
    const newItems = items.filter((i) => newValue.includes(i.id));
    onChange(newItems);
  };

  const hasNoResults = searchValue.trim() && filteredItems.length === 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-10 justify-between font-normal transition-all duration-200",
            "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            selectedItems.length === 0 && "text-slate-400 font-medium",
            buttonClassName
          )}
        >
          <span className="flex-1 flex flex-wrap gap-1.5 items-center">
            {selectedItems.length > 0 ? (
              <>
                {selectedItems.slice(0, maxSelectedDisplay).map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-sm"
                  >
                    {renderSelected
                      ? renderSelected([item])
                      : item.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="ml-1 p-0.5 hover:bg-primary/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedItems.length > maxSelectedDisplay && (
                  <span className="px-2 py-0.5 text-sm text-muted-foreground">
                    +{selectedItems.length - maxSelectedDisplay} more
                  </span>
                )}
              </>
            ) : (
              <span className="font-medium text-gray-500">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[--radix-popover-trigger-width] p-0 flex flex-col max-h-[400px]", className)}
        align="start"
      >
        <Command className="rounded-lg flex-1 overflow-hidden">
          <div className="flex h-12 items-center gap-2 border-b border-border/60 px-3">
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="max-h-[50vh] flex-1 rounded-none border-0 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-0 focus:ring-offset-0"
              disabled={disabled}
            />
          </div>
          <CommandList className="flex-1 overflow-y-auto">
            {loading && (
              <div className="py-3 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            )}

            {!loading && hasNoResults && (
              <div className="py-3 text-sm text-slate-500 text-center">
                No items found
              </div>
            )}

            {!loading && filteredItems.length > 0 && (
              <CommandGroup>
                {filteredItems.map((item) => {
                  const isSelected = value.includes(item.id);
                  return (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleToggle(item)}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-emerald-600",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderItem ? (
                        renderItem(item, isSelected)
                      ) : (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.subLabel && (
                            <span className="text-xs text-slate-400 ml-2">
                              {item.subLabel}
                            </span>
                          )}
                        </>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default MultiSelectDropdown;