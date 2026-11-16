"use client";

import { useRef, useState } from "react";
import { useNotifyForm } from "@/components/dashboard/notify-form";
import { HexColorPicker } from "react-colorful";
import { Popover as PopoverPrimitive } from "radix-ui";

interface ColorPickerProps {
  id: string;
  name: string;
  defaultValue: string;
}

export function ColorPicker({ id, name, defaultValue }: ColorPickerProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  // Picking from the popover changes `value` without a DOM event; tell the parent form.
  useNotifyForm(inputRef, value);

  return (
    <PopoverPrimitive.Root>
      <div className="border-input bg-background focus-within:ring-ring/50 flex h-10 items-center gap-2.5 rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-within:ring-[3px]">
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            className="border-border/60 h-5 w-5 shrink-0 cursor-pointer rounded-sm border transition-opacity hover:opacity-80"
            style={{ backgroundColor: value }}
            aria-label="Open color picker"
          />
        </PopoverPrimitive.Trigger>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-transparent font-mono text-sm outline-none"
          spellCheck={false}
        />
      </div>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className="cf-color-picker border-border bg-card z-50 w-56 rounded-lg border p-3 shadow-md outline-none"
        >
          <HexColorPicker color={value} onChange={setValue} />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border-input bg-background focus:ring-ring/50 mt-2.5 w-full rounded-md border px-3 py-1.5 font-mono text-sm outline-none focus:ring-[3px]"
            spellCheck={false}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
