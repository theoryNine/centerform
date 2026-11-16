"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { DateField } from "@/components/dashboard/date-field";
import { TimeField } from "@/components/dashboard/time-field";
import { joinLocal, splitLocal } from "@/lib/datetime";

interface Parts {
  date: string;
  time: string;
}
const EMPTY: Parts = { date: "", time: "" };

interface DateTimeFieldProps {
  /** Submitted as a hidden input holding "YYYY-MM-DDTHH:mm", or "" while incomplete. This is
   * exactly what <input type="datetime-local"> submitted, so the server actions are unchanged. */
  name: string;
  /** Visible label ("Starts"); "(required)" is appended when `required`. */
  label: string;
  /** Used in the controls' accessible names: "Start" gives "Start date" and "Start time". */
  shortLabel: string;
  required?: boolean;
  /** Uncontrolled: initial value (an ISO timestamp from the database is fine). */
  defaultValue?: string | null;
  /** Controlled: the current value. Pair with onChange. */
  value?: string;
  /** Called with the new value whenever it changes ("" when the date or time is incomplete). */
  onChange?: (value: string) => void;
  /** Earliest / latest selectable date, "YYYY-MM-DD". */
  minDate?: string;
  maxDate?: string;
  /** Error text shown under the field (with an icon); marks both controls invalid. */
  error?: string;
  /** Time to fill in when a date is picked and no time is set yet. */
  defaultTime?: string;
  /** Passed to the time list; see TimeField. */
  timeSlotFilter?: (slot: string) => boolean;
  timeSlotMeta?: (slot: string) => string | undefined;
  timeListHint?: string;
  timeScrollTo?: string;
  /** Rendered after the controls on the same row (e.g. a remove button). */
  trailing?: React.ReactNode;
  dateRef?: React.Ref<HTMLButtonElement>;
}

/** A date control and a time control side by side, with one hidden form value. */
export function DateTimeField({
  name,
  label,
  shortLabel,
  required,
  defaultValue,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  defaultTime,
  timeSlotFilter,
  timeSlotMeta,
  timeListHint,
  timeScrollTo,
  trailing,
  dateRef,
}: DateTimeFieldProps) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const errorId = `${uid}-error`;
  const [parts, setParts] = useState<Parts>(() => splitLocal(value ?? defaultValue) ?? EMPTY);
  const [timeError, setTimeError] = useState<string | null>(null);
  const timeRef = useRef<HTMLElement>(null);

  const joined = joinLocal(parts.date, parts.time);

  // Follow the parent when it changes the value (e.g. the end moving with the start). A half-filled
  // field (date but no time) is kept as long as the parent's value is still "".
  useEffect(() => {
    if (value === undefined || value === joined) return;
    const next = splitLocal(value);
    if (next) setParts(next);
    else if (value === "" && joined !== "") setParts(EMPTY);
  }, [value, joined]);

  function update(next: Parts) {
    setParts(next);
    const nextValue = joinLocal(next.date, next.time);
    if (nextValue !== joined) onChange?.(nextValue);
  }

  const shownError = error ?? timeError ?? undefined;

  return (
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      <input type="hidden" name={name} value={joined} />
      <div id={labelId} className="text-sm leading-none font-medium">
        {label}
        {required && " (required)"}
      </div>

      <div className="flex items-start gap-2">
        <div className="grid min-w-0 flex-1 grid-cols-[3fr_2fr] gap-2">
          <DateField
            ref={dateRef}
            label={`${shortLabel} date`}
            value={parts.date}
            onChange={(date) => update({ date, time: parts.time || defaultTime || "" })}
            min={minDate}
            max={maxDate}
            invalid={!!error}
            describedBy={shownError ? errorId : undefined}
            onAfterSelect={() => timeRef.current?.focus()}
          />
          <TimeField
            ref={timeRef}
            label={`${shortLabel} time`}
            value={parts.time}
            onChange={(time) => update({ date: parts.date, time })}
            invalid={!!shownError}
            describedBy={shownError ? errorId : undefined}
            slotFilter={timeSlotFilter}
            slotMeta={timeSlotMeta}
            listHint={timeListHint}
            scrollTo={timeScrollTo}
            onParseError={setTimeError}
          />
        </div>
        {trailing}
      </div>

      {shownError && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-sm font-medium text-red-700"
        >
          <CircleAlert aria-hidden className="size-4 shrink-0" />
          {shownError}
        </p>
      )}
    </div>
  );
}
