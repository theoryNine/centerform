"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateToLocal, formatDateLong, localToDate, todayLocal } from "@/lib/datetime";

// First day of the week for the browser's locale (0 = Sunday). Intl.Locale#getWeekInfo is
// missing in older browsers; Sunday is the fallback.
function localeWeekStart(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  try {
    const locale = new Intl.Locale(navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const first = (locale.getWeekInfo?.() ?? locale.weekInfo)?.firstDay;
    if (typeof first === "number") return (first % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  } catch {
    // fall through
  }
  return 0;
}

interface CalendarPanelProps {
  /** Selected date, "YYYY-MM-DD" (or "" for none). */
  value: string;
  onSelect: (date: string) => void;
  /** Earliest / latest selectable date, "YYYY-MM-DD". */
  min?: string;
  max?: string;
  /** Bottom-sheet size (50px days, Today + Done buttons) instead of the popover size. */
  sheet?: boolean;
  /** Sheet only: the Done button. */
  onDone?: () => void;
}

/** The month grid (react-day-picker, which provides the ARIA grid keyboard behavior) with the
 * dashboard's look, plus the Today / Done footer. */
export function CalendarPanel({
  value,
  onSelect,
  min,
  max,
  sheet = false,
  onDone,
}: CalendarPanelProps) {
  const selected = localToDate(value);
  const [month, setMonth] = useState<Date>(selected ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);

  // Popover only: put keyboard focus on the grid's current day (the selected day, else today).
  // react-day-picker keeps that one button at tabindex 0. In a sheet, Radix focuses the dialog.
  useEffect(() => {
    if (sheet) return;
    const frame = requestAnimationFrame(() => {
      rootRef.current
        ?.querySelector<HTMLButtonElement>('[role="grid"] button[tabindex="0"]')
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [sheet]);
  const lang = typeof navigator === "undefined" ? undefined : navigator.language;

  const minDate = min ? localToDate(min) : undefined;
  const maxDate = max ? localToDate(max) : undefined;
  const disabled = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  // Today is not offered when it falls outside min / max.
  const today = todayLocal();
  const todayAllowed = (!min || today >= min) && (!max || today <= max);

  function goToday() {
    onSelect(today);
    setMonth(new Date());
  }

  return (
    <div ref={rootRef} style={{ "--cell": sheet ? "50px" : "40px" } as React.CSSProperties}>
      <DayPicker
        mode="single"
        required
        animate={false}
        showOutsideDays
        fixedWeeks
        navLayout="around"
        weekStartsOn={localeWeekStart()}
        month={month}
        onMonthChange={setMonth}
        selected={selected}
        onSelect={(d) => d && onSelect(dateToLocal(d))}
        disabled={disabled}
        formatters={{
          formatWeekdayName: (d) => {
            const name = new Intl.DateTimeFormat(lang, { weekday: "short" }).format(d);
            return lang?.startsWith("en") ? name.slice(0, 2) : name;
          },
          formatCaption: (d) =>
            new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(d),
        }}
        labels={{
          labelDayButton: (d, modifiers) => {
            const full = formatDateLong(dateToLocal(d), lang);
            return modifiers.today ? `${full}, today` : full;
          },
        }}
        components={{
          Chevron: ({ orientation, className }) =>
            orientation === "left" ? (
              <ChevronLeft className={className} aria-hidden />
            ) : (
              <ChevronRight className={className} aria-hidden />
            ),
        }}
        classNames={{
          root: "w-fit",
          months: "relative",
          month: "grid grid-cols-[44px_1fr_44px] items-center gap-y-2",
          month_caption: "flex h-11 items-center justify-center",
          caption_label: "text-sm font-semibold",
          button_previous:
            "inline-flex size-11 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40",
          button_next:
            "inline-flex size-11 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40",
          chevron: "size-5",
          month_grid: "col-span-3 border-collapse",
          weekday: "size-[var(--cell)] text-center text-xs font-medium text-muted-foreground",
          day: "size-[var(--cell)] p-0 text-center",
          day_button:
            "inline-flex size-[var(--cell)] cursor-pointer items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
          selected:
            "[&>button]:bg-primary [&>button]:font-semibold [&>button]:text-primary-foreground [&>button:hover]:bg-primary",
          today: "[&>button]:ring-1 [&>button]:ring-primary [&>button]:ring-inset",
          outside: "[&>button]:text-muted-foreground",
          disabled: "[&>button]:pointer-events-none [&>button]:opacity-40",
        }}
      />

      {sheet ? (
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="h-12 flex-1"
            disabled={!todayAllowed}
            onClick={goToday}
          >
            Today
          </Button>
          <Button type="button" className="h-12 flex-1" onClick={onDone}>
            Done
          </Button>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <Button
            type="button"
            variant="ghost"
            className="text-primary h-9 px-3"
            disabled={!todayAllowed}
            onClick={goToday}
          >
            Today
          </Button>
          <p className="text-muted-foreground text-xs">Arrow keys move, Enter selects</p>
        </div>
      )}
    </div>
  );
}
