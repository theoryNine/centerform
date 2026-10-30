"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover as PopoverPrimitive } from "radix-ui";

interface ColorPickerProps {
  id: string;
  name: string;
  defaultValue: string;
}

export function ColorPicker({ id, name, defaultValue }: ColorPickerProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <PopoverPrimitive.Root>
      <div className="flex h-10 items-center gap-2.5 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-within:ring-[3px] focus-within:ring-ring/50">
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            className="h-5 w-5 shrink-0 cursor-pointer rounded-sm border border-border/60 transition-opacity hover:opacity-80"
            style={{ backgroundColor: value }}
            aria-label="Open color picker"
          />
        </PopoverPrimitive.Trigger>
        <input
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
          className="cf-color-picker z-50 w-56 rounded-lg border border-border bg-card p-3 shadow-md outline-none"
        >
          <HexColorPicker color={value} onChange={setValue} />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2.5 w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-sm outline-none focus:ring-[3px] focus:ring-ring/50"
            spellCheck={false}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
