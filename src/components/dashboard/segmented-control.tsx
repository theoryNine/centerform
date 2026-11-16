"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
  /** Why the option can't be chosen (shown as its tooltip). */
  disabledReason?: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  /** Form field name: the chosen value is submitted under it. */
  name: string;
  /** Accessible name of the group (also what a screen reader announces). */
  label: string;
  options: SegmentOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * A row of mutually exclusive options. Built on real radio inputs inside a radiogroup, so the
 * arrow keys, form submission and screen-reader behavior all come from the platform.
 */
export function SegmentedControl({
  name,
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("border-input bg-muted flex w-full gap-1 rounded-lg border p-1", className)}
    >
      {options.map((o) => (
        <label
          key={o.value}
          title={o.disabledReason}
          className={cn(
            "relative min-w-0 flex-1",
            o.disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            disabled={o.disabled}
            onChange={() => onValueChange(o.value)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "text-muted-foreground flex h-10 items-center justify-center truncate rounded-md px-2 text-sm font-medium transition-colors md:h-9",
              "peer-checked:bg-background peer-checked:text-foreground peer-checked:font-semibold peer-checked:shadow-sm",
              "peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px]",
              "peer-disabled:opacity-50",
              !o.disabled && "hover:text-foreground",
            )}
          >
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}
