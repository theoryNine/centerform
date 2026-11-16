import { describe, expect, it } from "vitest";
import {
  addMinutes,
  dateToLocal,
  diffMinutes,
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatTime,
  joinLocal,
  localToDate,
  nearestSlotIndex,
  parseTimeInput,
  splitLocal,
  timeSlots,
  toDatetimeLocal,
  uses12Hour,
  validateEventTimes,
} from "./datetime";

describe("parseTimeInput", () => {
  it.each([
    ["7pm", "19:00"],
    ["7:30pm", "19:30"],
    ["7:30 PM", "19:30"],
    ["7.30 pm", "19:30"],
    ["730p", "19:30"],
    ["7p", "19:00"],
    ["7 p.m.", "19:00"],
    ["19:30", "19:30"],
    ["1930", "19:30"],
    ["07:30", "07:30"],
    ["12am", "00:00"],
    ["12pm", "12:00"],
    ["12:15 am", "00:15"],
    ["0:00", "00:00"],
    ["  9:05am ", "09:05"],
  ])("reads %s as %s", (input, expected) => {
    expect(parseTimeInput(input)).toBe(expected);
  });

  it.each(["", "abc", "25:00", "7:75", "13pm", "0pm", "7:3", "24:00", "7 30", "noon"])(
    "rejects %j",
    (input) => {
      expect(parseTimeInput(input)).toBeNull();
    },
  );

  it("rejects an ambiguous bare hour in 12-hour mode", () => {
    expect(parseTimeInput("7")).toBeNull();
    expect(parseTimeInput("7:30")).toBeNull();
  });

  it("reads bare times as 24-hour in a 24-hour locale", () => {
    expect(parseTimeInput("7", { hour12: false })).toBe("07:00");
    expect(parseTimeInput("7:30", { hour12: false })).toBe("07:30");
  });
});

describe("formatTime", () => {
  it("formats a 12-hour clock with a plain space", () => {
    expect(formatTime("19:30", "en-US")).toBe("7:30 PM");
    expect(formatTime("00:05", "en-US")).toBe("12:05 AM");
    expect(formatTime("12:00", "en-US")).toBe("12:00 PM");
  });

  it("formats a 24-hour clock", () => {
    expect(formatTime("19:30", "de-DE")).toBe("19:30");
    expect(uses12Hour("de-DE")).toBe(false);
    expect(uses12Hour("en-US")).toBe(true);
  });

  it("is empty for an invalid time", () => {
    expect(formatTime("25:00", "en-US")).toBe("");
    expect(formatTime("", "en-US")).toBe("");
  });

  it("round-trips through parseTimeInput", () => {
    for (const slot of timeSlots(15)) {
      expect(parseTimeInput(formatTime(slot, "en-US"))).toBe(slot);
    }
  });
});

describe("split / join", () => {
  it("splits and joins a local value", () => {
    expect(splitLocal("2026-12-05T19:30")).toEqual({ date: "2026-12-05", time: "19:30" });
    expect(joinLocal("2026-12-05", "19:30")).toBe("2026-12-05T19:30");
  });

  it("accepts a stored ISO timestamp", () => {
    expect(splitLocal("2026-06-01T17:00:00+00:00")).toEqual({ date: "2026-06-01", time: "17:00" });
    expect(toDatetimeLocal("2026-06-01T17:00:00+00:00")).toBe("2026-06-01T17:00");
  });

  it("rejects impossible dates and times", () => {
    expect(splitLocal("2026-02-30T10:00")).toBeNull();
    expect(splitLocal("2026-04-31T10:00")).toBeNull();
    expect(splitLocal("2026-12-05T24:00")).toBeNull();
    expect(splitLocal("")).toBeNull();
    expect(splitLocal(null)).toBeNull();
    expect(joinLocal("2026-12-05", "")).toBe("");
    expect(joinLocal("", "19:30")).toBe("");
  });

  it("accepts a leap day only in a leap year", () => {
    expect(splitLocal("2028-02-29T10:00")).not.toBeNull();
    expect(splitLocal("2027-02-29T10:00")).toBeNull();
  });
});

describe("addMinutes / diffMinutes", () => {
  it("adds within a day", () => {
    expect(addMinutes("2026-12-05T19:30", 120)).toBe("2026-12-05T21:30");
  });

  it("crosses midnight, month and year", () => {
    expect(addMinutes("2026-12-05T22:00", 180)).toBe("2026-12-06T01:00");
    expect(addMinutes("2026-01-31T23:00", 120)).toBe("2026-02-01T01:00");
    expect(addMinutes("2026-12-31T23:30", 60)).toBe("2027-01-01T00:30");
    expect(addMinutes("2028-02-28T23:00", 120)).toBe("2028-02-29T01:00");
  });

  it("subtracts", () => {
    expect(addMinutes("2026-12-05T00:30", -60)).toBe("2026-12-04T23:30");
  });

  it("does not shift across a daylight-saving change (wall-clock arithmetic)", () => {
    // US spring-forward is 2026-03-08; adding 2 hours on the wall clock is exactly 2 hours.
    expect(addMinutes("2026-03-08T01:00", 120)).toBe("2026-03-08T03:00");
    expect(diffMinutes("2026-03-08T01:00", "2026-03-08T03:00")).toBe(120);
  });

  it("measures a duration across midnight", () => {
    expect(diffMinutes("2026-12-05T22:00", "2026-12-06T01:00")).toBe(180);
    expect(diffMinutes("2026-12-05T19:00", "2026-12-05T18:00")).toBe(-60);
  });

  it("is invalid-safe", () => {
    expect(addMinutes("nope", 10)).toBe("");
    expect(Number.isNaN(diffMinutes("", "2026-12-05T19:00"))).toBe(true);
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(60)).toBe("1 hr");
    expect(formatDuration(120)).toBe("2 hrs");
    expect(formatDuration(180)).toBe("3 hrs");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(90)).toBe("1 hr 30 min");
  });

  it("is empty for zero, negative or invalid", () => {
    expect(formatDuration(0)).toBe("");
    expect(formatDuration(-30)).toBe("");
    expect(formatDuration(NaN)).toBe("");
  });
});

describe("timeSlots / nearestSlotIndex", () => {
  it("lists 30-minute slots", () => {
    const slots = timeSlots();
    expect(slots).toHaveLength(48);
    expect(slots[0]).toBe("00:00");
    expect(slots[1]).toBe("00:30");
    expect(slots[47]).toBe("23:30");
  });

  it("finds the nearest slot", () => {
    const slots = timeSlots();
    expect(slots[nearestSlotIndex(slots, "19:00")]).toBe("19:00");
    expect(slots[nearestSlotIndex(slots, "19:20")]).toBe("19:30");
    expect(slots[nearestSlotIndex(slots, "19:14")]).toBe("19:00");
    expect(nearestSlotIndex([], "19:00")).toBe(-1);
    expect(nearestSlotIndex(slots, "nope")).toBe(-1);
  });
});

describe("validateEventTimes", () => {
  it("accepts a start alone, or a start with a later end", () => {
    expect(validateEventTimes("2026-12-05T19:00", "")).toBeNull();
    expect(validateEventTimes("2026-12-05T19:00", null)).toBeNull();
    expect(validateEventTimes("2026-12-05T19:00", "2026-12-05T21:00")).toBeNull();
    expect(validateEventTimes("2026-12-05T22:00", "2026-12-06T01:00")).toBeNull();
    expect(validateEventTimes("2026-06-01T17:00:00+00:00", "2026-06-01T18:00:00+00:00")).toBeNull();
  });

  it("rejects a missing or impossible start", () => {
    expect(validateEventTimes("", "")).toMatch(/start/i);
    expect(validateEventTimes(null, null)).toMatch(/start/i);
    expect(validateEventTimes("2026-02-30T10:00", "")).toMatch(/start/i);
    expect(validateEventTimes("garbage", "")).toMatch(/start/i);
  });

  it("rejects an invalid end, or one that is not after the start", () => {
    expect(validateEventTimes("2026-12-05T19:00", "nope")).toMatch(/end time is invalid/i);
    expect(validateEventTimes("2026-12-05T19:00", "2026-12-05T19:00")).toMatch(/after the start/i);
    expect(validateEventTimes("2026-12-05T19:00", "2026-12-05T18:00")).toMatch(/after the start/i);
  });
});

describe("date formatting", () => {
  it("formats a short and a long date", () => {
    expect(formatDateShort("2026-12-05", "en-US")).toBe("Sat, Dec 5, 2026");
    expect(formatDateLong("2026-12-05", "en-US")).toBe("Saturday, December 5, 2026");
    expect(formatDateShort("2026-02-30", "en-US")).toBe("");
  });

  it("converts to and from a local Date", () => {
    const d = localToDate("2026-12-05")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 11, 5]);
    expect(dateToLocal(d)).toBe("2026-12-05");
    expect(localToDate("2026-13-01")).toBeUndefined();
  });
});
