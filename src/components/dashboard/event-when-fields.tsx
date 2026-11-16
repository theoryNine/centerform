"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimeField } from "@/components/dashboard/date-time-field";
import {
  addMinutes,
  DEFAULT_START_TIME,
  diffMinutes,
  formatDuration,
  joinLocal,
  splitLocal,
  toDatetimeLocal,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";

export interface EventWhenHandle {
  /** Shows any errors and focuses the first problem field. Returns true when the times are fine. */
  validate: () => boolean;
}

interface EventWhenFieldsProps {
  defaultStart?: string | null;
  defaultEnd?: string | null;
  ref?: React.Ref<EventWhenHandle>;
}

const DURATIONS = [60, 120, 180];
const DEFAULT_DURATION = 120;
const START_REQUIRED = "Choose a start date and time.";
const END_BEFORE_START = "End time must be after the start time.";
const END_INCOMPLETE = "Choose an end date and time, or remove the end time.";

const validLocal = (v: string | null | undefined) => (splitLocal(v) ? toDatetimeLocal(v) : "");

/**
 * The Starts / Ends pair for an event. Owns the relationship between them:
 *  - moving the start moves the end with it, keeping the duration;
 *  - the end is optional ("Add end time" starts it 2 hours after the start);
 *  - the end must be after the start (shown live, and blocks saving).
 * Submits `start_time` and `end_time` as "YYYY-MM-DDTHH:mm" (end is "" when not set).
 */
export function EventWhenFields({ defaultStart, defaultEnd, ref }: EventWhenFieldsProps) {
  const [start, setStart] = useState(() => validLocal(defaultStart));
  const [end, setEnd] = useState(() => validLocal(defaultEnd));
  const [hasEnd, setHasEnd] = useState(() => validLocal(defaultEnd) !== "");
  const [submitErrors, setSubmitErrors] = useState<{ start?: string; end?: string }>({});

  const startDateRef = useRef<HTMLButtonElement>(null);
  const endDateRef = useRef<HTMLButtonElement>(null);
  const addEndRef = useRef<HTMLButtonElement>(null);
  const focusAfterRender = useRef<"end" | "add" | null>(null);

  useEffect(() => {
    if (focusAfterRender.current === "end") endDateRef.current?.focus();
    if (focusAfterRender.current === "add") addEndRef.current?.focus();
    focusAfterRender.current = null;
  }, [hasEnd]);

  const duration = hasEnd && start && end ? diffMinutes(start, end) : NaN;
  const endBeforeStart = Number.isFinite(duration) && duration <= 0;

  function handleStartChange(next: string) {
    // Keep the event's length when the start moves (this also carries the end date along).
    if (hasEnd && start && end && next && Number.isFinite(duration) && duration >= 0) {
      setEnd(addMinutes(next, duration));
    }
    setStart(next);
    setSubmitErrors((e) => ({ ...e, start: undefined, end: undefined }));
  }

  function handleEndChange(next: string) {
    setEnd(next);
    setSubmitErrors((e) => ({ ...e, end: undefined }));
  }

  function addEnd() {
    setEnd(start ? addMinutes(start, DEFAULT_DURATION) : "");
    setHasEnd(true);
    focusAfterRender.current = "end";
  }

  function removeEnd() {
    setEnd("");
    setHasEnd(false);
    setSubmitErrors((e) => ({ ...e, end: undefined }));
    focusAfterRender.current = "add";
  }

  useImperativeHandle(ref, () => ({
    validate() {
      if (!splitLocal(start)) {
        setSubmitErrors({ start: START_REQUIRED });
        startDateRef.current?.focus();
        return false;
      }
      if (hasEnd && !splitLocal(end)) {
        setSubmitErrors({ end: END_INCOMPLETE });
        endDateRef.current?.focus();
        return false;
      }
      if (endBeforeStart) {
        endDateRef.current?.focus();
        return false;
      }
      setSubmitErrors({});
      return true;
    },
  }));

  // End-time list: only slots after the start, labelled with how long the event would be.
  const startDate = splitLocal(start)?.date ?? "";
  const endDate = splitLocal(end)?.date ?? startDate;
  const durationOf = useCallback(
    (slot: string) => (start && endDate ? diffMinutes(start, joinLocal(endDate, slot)) : NaN),
    [start, endDate],
  );
  const endSlotFilter = useCallback(
    (slot: string) => {
      const d = durationOf(slot);
      return Number.isNaN(d) || d > 0;
    },
    [durationOf],
  );
  const endSlotMeta = useCallback(
    (slot: string) => formatDuration(durationOf(slot)) || undefined,
    [durationOf],
  );
  const endScrollTo = start ? splitLocal(addMinutes(start, DEFAULT_DURATION))?.time : undefined;

  const endError = endBeforeStart ? END_BEFORE_START : submitErrors.end;

  return (
    <div className="space-y-4">
      <DateTimeField
        name="start_time"
        label="Starts"
        shortLabel="Start"
        required
        value={start}
        onChange={handleStartChange}
        defaultTime={DEFAULT_START_TIME}
        error={submitErrors.start}
        dateRef={startDateRef}
      />

      {hasEnd ? (
        <div className="space-y-3">
          <DateTimeField
            name="end_time"
            label="Ends"
            shortLabel="End"
            value={end}
            onChange={handleEndChange}
            minDate={startDate || undefined}
            error={endError}
            timeSlotFilter={endSlotFilter}
            timeSlotMeta={endSlotMeta}
            timeListHint="Durations count from the start time"
            timeScrollTo={endScrollTo}
            dateRef={endDateRef}
            trailing={
              <Button
                type="button"
                variant="ghost"
                className="size-11 shrink-0 md:size-10"
                aria-label="Remove end time"
                onClick={removeEnd}
              >
                <X className="size-5" />
              </Button>
            }
          />

          <div role="group" aria-label="Duration" className="flex flex-wrap items-center gap-2">
            <span aria-hidden className="text-muted-foreground mr-1 text-sm">
              Duration
            </span>
            {DURATIONS.map((minutes) => {
              const pressed = duration === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={pressed}
                  disabled={!splitLocal(start)}
                  onClick={() => start && handleEndChange(addMinutes(start, minutes))}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors outline-none md:h-9",
                    "focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                    pressed
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-input bg-background hover:bg-muted",
                  )}
                >
                  {formatDuration(minutes)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="end_time" value="" />
          <Button
            ref={addEndRef}
            type="button"
            variant="ghost"
            className="text-primary dark:text-ring h-11 justify-start px-2 md:h-10"
            onClick={addEnd}
          >
            <Plus aria-hidden />
            Add end time
          </Button>
        </>
      )}
    </div>
  );
}
