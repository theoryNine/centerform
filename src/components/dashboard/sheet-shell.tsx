"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SheetShellProps {
  title: string;
  /** Screen-reader description of the sheet. */
  description?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  /** Sticky footer content (buttons). */
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Standard layout for the dashboard's right-hand edit sheets: a 64px header with the title and a
 * 44px close button, a scrolling body, and a sticky 72px footer. Renders the <form>, so the footer's
 * submit button submits it. Use <SheetSection> inside for the field groups.
 */
export function SheetShell({ title, description, onSubmit, footer, children }: SheetShellProps) {
  return (
    <SheetContent
      side="right"
      showCloseButton={false}
      className="w-full gap-0 p-0 sm:max-w-[440px]"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b pr-2 pl-4">
        <SheetTitle className="text-lg">{title}</SheetTitle>
        <SheetClose asChild>
          <Button type="button" variant="ghost" className="size-11" aria-label="Close">
            <X className="size-5" />
          </Button>
        </SheetClose>
      </div>
      <SheetDescription className="sr-only">{description ?? `${title} form`}</SheetDescription>

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">{children}</div>
        <div className="bg-background flex min-h-[72px] shrink-0 items-center gap-2 border-t px-4 py-3">
          {footer}
        </div>
      </form>
    </SheetContent>
  );
}

/** A labelled group of fields: a <fieldset> with a small uppercase <legend>, separated from the
 * previous section by a rule. */
export function SheetSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // first-of-type (not first:) because hidden inputs often precede the first section.
    <div className="border-t pt-6 first-of-type:border-t-0 first-of-type:pt-0">
      <fieldset className={cn("m-0 min-w-0 space-y-4 border-0 p-0", className)}>
        <legend className="text-muted-foreground mb-3 p-0 text-xs font-semibold tracking-wider uppercase">
          {title}
        </legend>
        {children}
      </fieldset>
    </div>
  );
}

/** A switch row with a visible label and hint. Submits "true" / "false" under `name` through a
 * hidden input, matching what the server actions already expect. */
export function SwitchRow({
  id,
  name,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  name: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <input type="hidden" name={name} value={String(checked)} />
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
      />
    </div>
  );
}
