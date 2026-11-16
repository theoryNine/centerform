// Small pure helpers shared by the dashboard list pages (search, grouping, event phases).

/** Case-insensitive "does every word of the query appear in the haystack". Empty query matches. */
export function matchesQuery(query: string, ...parts: (string | null | undefined)[]): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = parts.filter(Boolean).join(" ").toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/** Groups items by key, keeping the order in which each key first appears. */
export function groupInOrder<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = groups.get(k);
    if (list) list.push(item);
    else groups.set(k, [item]);
  }
  return [...groups.entries()];
}

/** "room_service" -> "Room service". */
export function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export type EventPhase = "past" | "today" | "upcoming";

/**
 * Where an event sits relative to `now`. An event is past once its end (or start, if it has no
 * end) has gone by; "today" is anything not yet over that starts before tonight. A bad end time
 * (before the start) is treated as the start so it is never wrongly "past".
 */
export function eventPhase(start: string, end: string | null, now: Date = new Date()): EventPhase {
  const startMs = new Date(start).getTime();
  const endMs = Math.max(startMs, end ? new Date(end).getTime() : startMs);
  if (Number.isNaN(startMs)) return "upcoming";
  if (endMs < now.getTime()) return "past";
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return startMs <= endOfToday.getTime() ? "today" : "upcoming";
}

/** { month: "DEC", day: "5" } for the date tile. */
export function dateTile(start: string, locale?: string): { month: string; day: string } {
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return { month: "", day: "" };
  return {
    month: new Intl.DateTimeFormat(locale, { month: "short" }).format(d).toUpperCase(),
    day: String(d.getDate()),
  };
}

/** "December 2026", used as the group heading in the events list. */
export function monthHeading(start: string, locale?: string): string {
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return "No date";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d);
}
