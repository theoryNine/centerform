"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { matchesQuery } from "@/lib/dashboard-lists";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Secondary text shown (and searched) beside the label, e.g. the area. */
  description?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  /** Selected value, or "". */
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name. */
  label: string;
  /** Form field name: the chosen value is submitted under it. */
  name?: string;
  placeholder?: string;
  emptyText?: string;
  id?: string;
  invalid?: boolean;
}

/**
 * A searchable single-select (ARIA combobox with a listbox popup). Focus stays in the input; the
 * highlighted option is announced through aria-activedescendant. Arrow keys move, Enter picks,
 * Escape closes. Built here rather than pulling in a dependency.
 */
export function Combobox({
  options,
  value,
  onValueChange,
  label,
  name,
  placeholder = "Search…",
  emptyText = "No matches",
  id,
  invalid,
}: ComboboxProps) {
  const uid = useId();
  const listId = `${uid}-list`;
  const selected = options.find((o) => o.value === value);

  const [text, setText] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Typing filters; just opening the list (or re-opening after a pick) shows everything.
  const [filtering, setFiltering] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setText(selected?.label ?? ""), [selected?.label]);

  const visible = useMemo(
    () => (filtering ? options.filter((o) => matchesQuery(text, o.label, o.description)) : options),
    [filtering, options, text],
  );

  // Keep the highlighted option in view inside the list.
  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [activeIndex, open, visible.length]);

  function openList() {
    if (open) return;
    setFiltering(false);
    const at = visible.findIndex((o) => o.value === value);
    setActiveIndex(at >= 0 ? at : 0);
    setOpen(true);
  }

  function pick(option: ComboboxOption) {
    onValueChange(option.value);
    setText(option.label);
    setFiltering(false);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openList();
      else setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openList();
      else setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setActiveIndex(visible.length - 1);
    } else if (e.key === "Enter") {
      // Never submit the form from here; Enter picks the highlighted option while the list is open.
      e.preventDefault();
      if (open && visible[activeIndex]) pick(visible[activeIndex]);
    }
    // Escape is handled by the popover (closes the list, not the sheet behind it).
  }

  const activeId = open && visible[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => (o ? openList() : setOpen(false))}>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverPrimitive.Anchor asChild>
        <div
          className={cn(
            "border-input bg-background flex h-11 w-full items-center gap-2 rounded-md border px-3 text-sm shadow-xs md:h-10",
            "focus-within:ring-ring/50 focus-within:ring-[3px]",
            invalid && "border-destructive",
          )}
        >
          <input
            id={id}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            aria-label={label}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-invalid={invalid || undefined}
            placeholder={placeholder}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFiltering(true);
              setActiveIndex(0);
              if (!open) setOpen(true);
            }}
            onClick={openList}
            onKeyDown={handleKeyDown}
            onBlur={() => setText(selected?.label ?? "")}
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none"
          />
          <ChevronsUpDown aria-hidden className="text-muted-foreground size-4 shrink-0" />
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          role="presentation"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if ((e.target as Element | null)?.closest?.('[role="combobox"]')) e.preventDefault();
          }}
          className="border-border bg-card text-card-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-[80] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border shadow-md outline-none"
        >
          {visible.length === 0 ? (
            <p className="text-muted-foreground px-3 py-3 text-sm">{emptyText}</p>
          ) : (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={label}
              className="max-h-64 overflow-y-auto py-1"
            >
              {visible.map((o, i) => (
                <li
                  key={o.value}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={o.value === value}
                  data-active={i === activeIndex}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => pick(o)}
                  className={cn(
                    "hover:bg-muted data-[active=true]:bg-muted flex min-h-11 cursor-pointer items-center gap-2 px-3 py-1.5 text-sm",
                    o.value === value && "bg-primary/10 font-medium",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.description && (
                      <span className="text-muted-foreground block truncate text-xs font-normal">
                        {o.description}
                      </span>
                    )}
                  </span>
                  {o.value === value && (
                    <Check aria-hidden className="text-primary size-4 shrink-0" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
