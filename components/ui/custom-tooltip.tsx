"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";

interface CustomTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  /** Which side of the trigger the tooltip appears on. */
  side?: TooltipSide;
  /** Alignment along the cross axis. */
  align?: TooltipAlign;
  /** Hover delay (ms) before showing. */
  delay?: number;
  /** When true, the tooltip never shows. */
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
}

const sideClasses: Record<TooltipSide, string> = {
  top: "bottom-full mb-2",
  right: "left-full ml-2",
  bottom: "top-full mt-2",
  left: "right-full mr-2",
};

const alignClasses: Record<TooltipSide, Record<TooltipAlign, string>> = {
  top: {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  bottom: {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  left: {
    start: "top-0",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-0",
  },
  right: {
    start: "top-0",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-0",
  },
};

export function CustomTooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 120,
  disabled = false,
  className,
  wrapperClassName,
}: CustomTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = React.useCallback(() => {
    if (disabled || !content) return;
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }, [clearTimer, content, delay, disabled]);

  const hide = React.useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  React.useEffect(() => clearTimer, [clearTimer]);

  const isEnabled = !disabled && !!content;

  return (
    <span
      className={cn("relative inline-flex", wrapperClassName)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {isEnabled && (
        <span
          role="tooltip"
          aria-hidden={!open}
          className={cn(
            "pointer-events-none absolute whitespace-nowrap rounded-sm bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-150 ease-out z-[99999999]",
            "dark:bg-slate-700",
            sideClasses[side],
            alignClasses[side][align],
            open ? "scale-100 opacity-100" : "scale-95 opacity-0",
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export default CustomTooltip;
