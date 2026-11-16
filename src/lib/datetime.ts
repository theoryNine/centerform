// Date and time helpers for the dashboard's date/time picker.
//
// Values are "wall-clock" strings with no time zone, exactly what <input type="datetime-local">
// produced and what the server actions expect: "YYYY-MM-DDTHH:mm" (date "YYYY-MM-DD", time "HH:mm").
// Arithmetic on them (adding a duration, comparing) is done on the wall clock via Date.UTC, so it
// never depends on the browser's zone or its daylight-saving rules.
//
// KNOWN ISSUE (time zones): the `events` columns are timestamptz and the venue has no time zone,
// so a wall-clock value submitted from here is stored as if it were UTC, while the guest site shows
// event times in the guest's own zone. See datetime-picker-handoff.md section 8.

export const DEFAULT_START_TIME = "19:00";

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2})$/;

const pad = (n: number) => String(n).padStart(2, "0");

/** The stored ISO timestamp cut to "YYYY-MM-DDTHH:mm" (what the native input was given). */
export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function isValidDate(date: string): boolean {
  const m = DATE_RE.exec(date);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(Date.UTC(y, mo - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === mo - 1 && probe.getUTCDate() === d;
}

export function isValidTime(time: string): boolean {
  const m = TIME_RE.exec(time);
  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59;
}

/** Splits "YYYY-MM-DDTHH:mm" (longer ISO strings are cut first). Null if not a real date and time. */
export function splitLocal(
  value: string | null | undefined,
): { date: string; time: string } | null {
  const v = toDatetimeLocal(value);
  const m = LOCAL_RE.exec(v);
  if (!m) return null;
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  const time = `${m[4]}:${m[5]}`;
  return isValidDate(date) && isValidTime(time) ? { date, time } : null;
}

/** "" unless both parts are valid. */
export function joinLocal(date: string, time: string): string {
  return isValidDate(date) && isValidTime(time) ? `${date}T${time}` : "";
}

function localToMs(value: string): number {
  const m = LOCAL_RE.exec(value);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
}

/** `value` plus `minutes` on the wall clock (crosses midnight, month and year boundaries). */
export function addMinutes(value: string, minutes: number): string {
  const ms = localToMs(value);
  if (Number.isNaN(ms)) return "";
  const d = new Date(ms + minutes * 60_000);
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  );
}

/** Minutes from `from` to `to` (negative if `to` is earlier); NaN if either is invalid. */
export function diffMinutes(from: string, to: string): number {
  return (localToMs(to) - localToMs(from)) / 60_000;
}

/** "1 hr", "2 hrs", "45 min", "1 hr 30 min". Empty for zero or negative. */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? "hr" : "hrs"}`);
  if (m > 0) parts.push(`${m} min`);
  return parts.join(" ");
}

/** Every `stepMinutes` of the day as "HH:mm". */
export function timeSlots(stepMinutes = 30): string[] {
  const out: string[] = [];
  for (let t = 0; t < 24 * 60; t += stepMinutes)
    out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  return out;
}

const minutesOfDay = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** Index of the slot closest to `time` (first one on a tie). */
export function nearestSlotIndex(slots: string[], time: string): number {
  if (slots.length === 0 || !isValidTime(time)) return -1;
  const target = minutesOfDay(time);
  let best = 0;
  for (let i = 1; i < slots.length; i++) {
    if (Math.abs(minutesOfDay(slots[i]) - target) < Math.abs(minutesOfDay(slots[best]) - target)) {
      best = i;
    }
  }
  return best;
}

/**
 * Reads a typed time: "7pm", "7:30pm", "7.30 pm", "730p", "19:30", "1930", "07:30".
 * Returns "HH:mm", or null if it can't be read. In 12-hour mode a bare "7" or "7:30" is ambiguous
 * (am or pm?) and is rejected, except when it is clearly 24-hour (hour 0 or 13-23, or "07:30").
 */
export function parseTimeInput(text: string, opts: { hour12?: boolean } = {}): string | null {
  const hour12 = opts.hour12 ?? true;
  const s = text
    .trim()
    .toLowerCase()
    .replace(/([ap])\.?\s*m\.?/g, "$1m") // "p.m." / "p m" -> "pm"
    .replace(/\./g, ":");
  const m = /^(\d{1,2}):?(\d{2})?\s*([ap])?m?$/.exec(s);
  if (!m) return null;
  const hourText = m[1];
  const hour = Number(hourText);
  const minute = m[2] === undefined ? 0 : Number(m[2]);
  const period = m[3] as "a" | "p" | undefined;
  if (minute > 59) return null;

  let h: number;
  if (period) {
    if (hour < 1 || hour > 12) return null;
    h = (hour % 12) + (period === "p" ? 12 : 0);
  } else {
    const clearly24 =
      !hour12 || hour === 0 || hour >= 13 || (hourText.length === 2 && hourText[0] === "0");
    if (!clearly24) return null;
    if (hour > 23) return null;
    h = hour;
  }
  return `${pad(h)}:${pad(minute)}`;
}

const NBSP = /[  ]/g;

/** True if the locale shows a 12-hour clock. */
export function uses12Hour(locale?: string): boolean {
  return new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12 ?? true;
}

/** "19:30" -> "7:30 PM" (or "19:30" in 24-hour locales). Empty for an invalid time. */
export function formatTime(time: string, locale?: string): string {
  if (!isValidTime(time)) return "";
  const d = new Date(2000, 0, 1, Number(time.slice(0, 2)), Number(time.slice(3, 5)));
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" })
    .format(d)
    .replace(NBSP, " ");
}

function dateParts(date: string): Date {
  const m = DATE_RE.exec(date)!;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** "2026-12-05" -> "Sat, Dec 5, 2026". */
export function formatDateShort(date: string, locale?: string): string {
  if (!isValidDate(date)) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateParts(date));
}

/** "2026-12-05" -> "Saturday, December 5, 2026" (for accessible names). */
export function formatDateLong(date: string, locale?: string): string {
  if (!isValidDate(date)) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dateParts(date));
}

/**
 * First problem with an event's start and end ("YYYY-MM-DDTHH:mm" or an ISO timestamp), or null.
 * The picker checks this in the browser; the server action checks it again.
 */
export function validateEventTimes(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  if (!splitLocal(start)) return "Start time is missing or invalid.";
  if (end) {
    if (!splitLocal(end)) return "End time is invalid.";
    if (diffMinutes(toDatetimeLocal(start), toDatetimeLocal(end)) <= 0) {
      return "End time must be after the start time.";
    }
  }
  return null;
}

/** Local calendar date of a Date object as "YYYY-MM-DD". */
export function dateToLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" as a local-midnight Date (what react-day-picker works with); undefined if invalid. */
export function localToDate(date: string): Date | undefined {
  return isValidDate(date) ? dateParts(date) : undefined;
}

export function todayLocal(): string {
  return dateToLocal(new Date());
}
