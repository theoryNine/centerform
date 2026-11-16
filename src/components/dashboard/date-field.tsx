"use client";

import { useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CalendarPanel } from "@/components/dashboard/calendar-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatDateShort } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/** Phones and touch devices get bottom sheets; everything else gets popovers. The same
 * calendar and time list are used in both, so only the container changes. (The handoff also
 * allows native date/time inputs on touch devices; we kept the custom design for consistency.) */
export const COMPACT_PICKER_QUERY = "(max-width: 767px), (pointer: coarse)";

export const pickerControlClass =
  "flex h-11 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive md:h-10";

interface DateFieldProps {
  /** "YYYY-MM-DD", or "" for none. */
  value: string;
  onChange: (date: string) => void;
  /** Accessible name, e.g. "Start date". */
  label: string;
  min?: string;
  max?: string;
  invalid?: boolean;
  describedBy?: string;
  /** Called after a day is picked in the popover, once the popover has closed (focus handoff). */
  onAfterSelect?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}

export function DateField({
  value,
  onChange,
  label,
  min,
  max,
  invalid,
  describedBy,
  onAfterSelect,
  ref,
}: DateFieldProps) {
  const compact = useMediaQuery(COMPACT_PICKER_QUERY);
  const [open, setOpen] = useState(false);
  const skipFocusRestore = useRef(false);

  const lang = typeof navigator === "undefined" ? undefined : navigator.language;
  const trigger = (
    <button
      ref={ref}
      type="button"
      className={cn(pickerControlClass, !value && "text-muted-foreground")}
      aria-haspopup="dialog"
      aria-expanded={open}
      // The name must contain the visible text (WCAG 2.5.3), so it ends with the short date.
      aria-label={`${label}, ${value ? formatDateShort(value, lang) : "Choose a date"}`}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onClick={compact ? () => setOpen(true) : undefined}
    >
      <CalendarDays aria-hidden className="text-muted-foreground size-4 shrink-0" />
      <span className="truncate">{value ? formatDateShort(value, lang) : "Choose a date"}</span>
    </button>
  );

  if (compact) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            aria-describedby={undefined}
            className="gap-0 rounded-t-2xl p-0"
          >
            <div
              aria-hidden
              className="bg-muted-foreground/40 mx-auto mt-2 h-1 w-10 rounded-full"
            />
            <div className="flex h-14 items-center justify-between pr-2 pl-5">
              <SheetTitle className="text-base">{label}</SheetTitle>
              <SheetDescription className="sr-only">
                Choose a date from the calendar.
              </SheetDescription>
              <Button
                type="button"
                variant="ghost"
                className="size-11"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex justify-center px-3 pb-5">
              <CalendarPanel
                sheet
                value={value}
                onSelect={onChange}
                min={min}
                max={max}
                onDone={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          aria-label={`Choose ${label.toLowerCase()}`}
          // The calendar focuses its selected (or today's) day itself.
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => {
            if (skipFocusRestore.current) {
              e.preventDefault();
              skipFocusRestore.current = false;
            }
          }}
          className="border-border bg-card text-card-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 rounded-lg border p-3 shadow-md outline-none"
        >
          <CalendarPanel
            value={value}
            onSelect={(date) => {
              onChange(date);
              skipFocusRestore.current = !!onAfterSelect;
              setOpen(false);
              if (onAfterSelect) requestAnimationFrame(onAfterSelect);
            }}
            min={min}
            max={max}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
