"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { COMPACT_PICKER_QUERY, pickerControlClass } from "@/components/dashboard/date-field";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DEFAULT_START_TIME,
  formatTime,
  nearestSlotIndex,
  parseTimeInput,
  timeSlots,
  uses12Hour,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";

/** "Enter a time like 7:30 PM" (or 19:30 in a 24-hour locale). */
export function timeErrorMessage(locale?: string): string {
  return `Enter a time like ${formatTime("19:30", locale)}`;
}

// --- The list -----------------------------------------------------------------------------

interface TimeListboxProps {
  id: string;
  label: string;
  options: string[];
  value: string;
  activeIndex: number;
  locale?: string;
  metaFor?: (slot: string) => string | undefined;
  onPick: (slot: string) => void;
  /** Make the list itself keyboard-focusable and drive it with these keys (touch sheet, where
   * there is no text box to hold focus). */
  onListKeyDown?: React.KeyboardEventHandler<HTMLUListElement>;
}

function TimeListbox({
  id,
  label,
  options,
  value,
  activeIndex,
  locale,
  metaFor,
  onPick,
  onListKeyDown,
}: TimeListboxProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const placed = useRef(false);

  // Scroll inside the list only (scrollIntoView could scroll the page or the sheet behind it).
  // First placement centers the active option; later moves (arrow keys) just keep it in view.
  useLayoutEffect(() => {
    const list = listRef.current;
    const option = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !option) return;
    if (!placed.current) {
      list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
      placed.current = true;
    } else if (option.offsetTop < list.scrollTop) {
      list.scrollTop = option.offsetTop;
    } else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [activeIndex]);

  return (
    <ul
      ref={listRef}
      id={id}
      role="listbox"
      aria-label={label}
      tabIndex={onListKeyDown ? 0 : undefined}
      onKeyDown={onListKeyDown}
      aria-activedescendant={
        onListKeyDown && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
      }
      className="focus-visible:ring-ring/50 max-h-[264px] overflow-y-auto py-1 outline-none focus-visible:ring-[3px] focus-visible:ring-inset"
    >
      {options.map((slot, i) => {
        const selected = slot === value;
        const meta = metaFor?.(slot);
        return (
          <li
            key={slot}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={selected}
            data-active={i === activeIndex}
            // Keep focus in the input (or sheet) instead of moving it to the option.
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onPick(slot)}
            className={cn(
              "hover:bg-muted data-[active=true]:bg-muted flex h-11 cursor-pointer items-center gap-2 px-3 text-sm",
              selected && "bg-primary/10 font-medium",
            )}
          >
            <span className="flex-1">
              {formatTime(slot, locale)}
              {meta && <span className="text-muted-foreground ml-2 font-normal">({meta})</span>}
            </span>
            {selected && <Check aria-hidden className="text-primary size-4" />}
          </li>
        );
      })}
    </ul>
  );
}

// --- The field ----------------------------------------------------------------------------

interface TimeFieldProps {
  /** "HH:mm", or "" for none. */
  value: string;
  onChange: (time: string) => void;
  /** Accessible name, e.g. "Start time". */
  label: string;
  invalid?: boolean;
  describedBy?: string;
  /** Hide slots (e.g. end times that are not after the start). */
  slotFilter?: (slot: string) => boolean;
  /** Extra text shown after a slot, e.g. "2 hrs". Rendered as "(2 hrs)". */
  slotMeta?: (slot: string) => string | undefined;
  /** Hint under the list. */
  listHint?: string;
  /** Slot to scroll to when nothing is selected. Default 7:00 PM. */
  scrollTo?: string;
  /** Reports a typed value that could not be read (and null when it is fine again). */
  onParseError?: (message: string | null) => void;
  /** Focus target: the input on desktop, the button on touch devices. */
  ref?: React.Ref<HTMLElement>;
}

/**
 * Time combobox. Desktop: a text input you can type into ("7pm", "19:30", "730p") with a popover
 * list of 30-minute slots (ARIA combobox + listbox, focus stays in the input). Touch: a button that
 * opens a bottom sheet with the same list and a text box.
 */
export function TimeField({
  value,
  onChange,
  label,
  invalid,
  describedBy,
  slotFilter,
  slotMeta,
  listHint = "Or type a time, like 7:45pm",
  scrollTo = DEFAULT_START_TIME,
  onParseError,
  ref,
}: TimeFieldProps) {
  const compact = useMediaQuery(COMPACT_PICKER_QUERY);
  const uid = useId();
  const listId = `${uid}-list`;
  const lang = typeof navigator === "undefined" ? undefined : navigator.language;
  const hour12 = uses12Hour(lang);

  const [text, setText] = useState(formatTime(value, lang));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigated = useRef(false); // arrow keys moved the highlight since the last typing

  // Show external changes (a duration chip, a moved start) in the box.
  useEffect(() => setText(formatTime(value, lang)), [value, lang]);

  // A typed time such as 7:45 PM is not a slot but must still show while selected.
  const options = useMemo(() => {
    const all = timeSlots();
    if (value && !all.includes(value)) all.push(value);
    all.sort();
    return slotFilter ? all.filter(slotFilter) : all;
  }, [value, slotFilter]);

  function startIndex(): number {
    const selected = options.indexOf(value);
    return selected >= 0 ? selected : nearestSlotIndex(options, scrollTo);
  }

  function openList() {
    if (open) return;
    navigated.current = false;
    setActiveIndex(startIndex());
    setOpen(true);
  }

  function pick(slot: string) {
    onChange(slot);
    setText(formatTime(slot, lang));
    onParseError?.(null);
    setOpen(false);
  }

  // Turns the typed text into a value, or puts the old value back and reports the problem.
  function commitText() {
    const typed = text.trim();
    if (typed === "" && value === "") {
      onParseError?.(null);
      return;
    }
    const parsed = parseTimeInput(typed, { hour12 });
    if (parsed === null) {
      setText(formatTime(value, lang));
      onParseError?.(timeErrorMessage(lang));
      return;
    }
    if (parsed !== value) onChange(parsed);
    setText(formatTime(parsed, lang));
    onParseError?.(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openList();
        return;
      }
      navigated.current = true;
      const last = options.length - 1;
      setActiveIndex((i) =>
        e.key === "ArrowDown" ? Math.min(i + 1, last) : Math.max(i <= 0 ? 0 : i - 1, 0),
      );
    } else if (e.key === "Enter") {
      e.preventDefault(); // commit the time; don't submit the whole form from here
      if (open && navigated.current && options[activeIndex]) pick(options[activeIndex]);
      else {
        commitText();
        setOpen(false);
      }
    }
  }

  // Touch sheet: the list holds focus, so it handles the arrow keys itself.
  function handleListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActiveIndex((i) => Math.min(i + 1, last));
    else if (e.key === "ArrowUp") setActiveIndex((i) => Math.max(i - 1, 0));
    else if (e.key === "Home") setActiveIndex(0);
    else if (e.key === "End") setActiveIndex(last);
    else if ((e.key === "Enter" || e.key === " ") && options[activeIndex])
      pick(options[activeIndex]);
    else return;
    e.preventDefault();
  }

  function handleTyping(next: string) {
    setText(next);
    navigated.current = false;
    if (!open) setOpen(true);
    const parsed = parseTimeInput(next, { hour12 });
    setActiveIndex(parsed ? nearestSlotIndex(options, parsed) : -1);
  }

  const listbox = (
    <TimeListbox
      id={listId}
      label={label}
      options={options}
      value={value}
      activeIndex={activeIndex}
      locale={lang}
      metaFor={slotMeta}
      onPick={pick}
      onListKeyDown={compact ? handleListKeyDown : undefined}
    />
  );

  if (compact) {
    return (
      <>
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={cn(pickerControlClass, !value && "text-muted-foreground")}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${label}, ${value ? formatTime(value, lang) : "Choose a time"}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onClick={() => {
            setActiveIndex(startIndex());
            setOpen(true);
          }}
        >
          <Clock aria-hidden className="text-muted-foreground size-4 shrink-0" />
          <span className="truncate">{value ? formatTime(value, lang) : "Choose a time"}</span>
        </button>
        <TimeSheet
          open={open}
          onOpenChange={setOpen}
          label={label}
          hint={listHint}
          hour12={hour12}
          onTyped={(time) => pick(time)}
        >
          {listbox}
        </TimeSheet>
      </>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => (o ? openList() : setOpen(false))}>
      <PopoverPrimitive.Anchor asChild>
        <div
          className={cn(pickerControlClass, "focus-within:ring-ring/50 focus-within:ring-[3px]")}
          aria-invalid={invalid || undefined}
        >
          <Clock aria-hidden className="text-muted-foreground size-4 shrink-0" />
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            aria-label={label}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
            }
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            placeholder="Choose a time"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onClick={openList}
            onKeyDown={handleKeyDown}
            onBlur={commitText}
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          // Focus stays in the input; the list is driven with aria-activedescendant. The wrapper
          // is only a positioned container for the listbox, not a dialog.
          role="presentation"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if ((e.target as Element | null)?.closest?.('[role="combobox"]')) e.preventDefault();
          }}
          className="border-border bg-card text-card-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 w-[max(var(--radix-popover-trigger-width),200px)] rounded-lg border shadow-md outline-none"
        >
          {listbox}
          <p className="text-muted-foreground border-t px-3 py-2 text-xs">{listHint}</p>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

// --- Touch: bottom sheet ------------------------------------------------------------------

function TimeSheet({
  open,
  onOpenChange,
  label,
  hint,
  hour12,
  onTyped,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  hint: string;
  hour12: boolean;
  onTyped: (time: string) => void;
  children: React.ReactNode;
}) {
  const hintId = `${useId()}-hint`;
  const lang = typeof navigator === "undefined" ? undefined : navigator.language;
  const [typed, setTyped] = useState("");
  const [error, setError] = useState(false);

  function submitTyped() {
    if (typed.trim() === "") return;
    const parsed = parseTimeInput(typed, { hour12 });
    if (parsed) {
      setError(false);
      setTyped("");
      onTyped(parsed);
    } else {
      setError(true);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[85dvh] gap-0 rounded-t-2xl p-0"
      >
        <div aria-hidden className="bg-muted-foreground/40 mx-auto mt-2 h-1 w-10 rounded-full" />
        <div className="flex h-14 shrink-0 items-center justify-between pr-2 pl-5">
          <SheetTitle className="text-base">{label}</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a time from the list or type one.
          </SheetDescription>
          <Button
            type="button"
            variant="ghost"
            className="size-11"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-2">{children}</div>
        <div className="space-y-1 border-t p-3">
          <Input
            value={typed}
            inputMode="text"
            aria-label="Type a time"
            aria-invalid={error || undefined}
            aria-describedby={hintId}
            placeholder="Type a time"
            className="h-11"
            onChange={(e) => {
              setTyped(e.target.value);
              setError(false);
            }}
            onBlur={submitTyped}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitTyped();
              }
            }}
          />
          <p
            id={hintId}
            className={cn("text-xs", error ? "font-medium text-red-700" : "text-muted-foreground")}
            role={error ? "alert" : undefined}
          >
            {error ? timeErrorMessage(lang) : hint}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
