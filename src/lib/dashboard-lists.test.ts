import { describe, expect, it } from "vitest";
import {
  dateTile,
  eventPhase,
  groupInOrder,
  humanize,
  matchesQuery,
  monthHeading,
  plural,
} from "./dashboard-lists";

describe("matchesQuery", () => {
  it("matches every word, case-insensitively, across the parts", () => {
    expect(matchesQuery("wifi", "Wi-Fi", "internet")).toBe(false);
    expect(matchesQuery("WI-FI int", "Wi-Fi", "Internet access")).toBe(true);
    expect(matchesQuery("spa massage", "Spa", "Deep tissue massage")).toBe(true);
    expect(matchesQuery("spa pool", "Spa", "Deep tissue massage")).toBe(false);
  });

  it("matches everything for an empty or blank query, and ignores null parts", () => {
    expect(matchesQuery("", "anything")).toBe(true);
    expect(matchesQuery("   ", null, undefined)).toBe(true);
    expect(matchesQuery("a", null, "a")).toBe(true);
  });
});

describe("groupInOrder", () => {
  it("keeps first-seen order of groups and items", () => {
    expect(groupInOrder(["b1", "a1", "b2", "c1", "a2"], (s) => s[0])).toEqual([
      ["b", ["b1", "b2"]],
      ["a", ["a1", "a2"]],
      ["c", ["c1"]],
    ]);
  });
});

describe("humanize / plural", () => {
  it("formats", () => {
    expect(humanize("room_service")).toBe("Room service");
    expect(humanize("spa")).toBe("Spa");
    expect(plural(1, "service")).toBe("1 service");
    expect(plural(12, "service")).toBe("12 services");
    expect(plural(0, "place")).toBe("0 places");
    expect(plural(2, "city", "cities")).toBe("2 cities");
  });
});

describe("eventPhase", () => {
  const now = new Date(2026, 11, 5, 14, 0); // Dec 5 2026, 2:00 PM local
  const at = (d: number, h: number, m = 0) => new Date(2026, 11, d, h, m).toISOString();

  it("is past once the end has gone by", () => {
    expect(eventPhase(at(5, 9), at(5, 11), now)).toBe("past");
    expect(eventPhase(at(4, 19), null, now)).toBe("past");
  });

  it("uses the start when there is no end", () => {
    expect(eventPhase(at(5, 13), null, now)).toBe("past");
    expect(eventPhase(at(5, 19), null, now)).toBe("today");
  });

  it("is today while it is still ahead or in progress on the same day", () => {
    expect(eventPhase(at(5, 13), at(5, 16), now)).toBe("today"); // in progress
    expect(eventPhase(at(5, 23, 30), null, now)).toBe("today");
  });

  it("is upcoming from tomorrow on", () => {
    expect(eventPhase(at(6, 0, 30), null, now)).toBe("upcoming");
    expect(eventPhase(at(20, 19), at(20, 21), now)).toBe("upcoming");
  });

  it("treats an end before the start as the start (never wrongly past)", () => {
    expect(eventPhase(at(5, 19), at(1, 10), now)).toBe("today");
  });

  it("a multi-day event that started earlier is not past until it ends", () => {
    expect(eventPhase(at(3, 10), at(7, 10), now)).toBe("today");
  });

  it("falls back to upcoming for an unreadable date", () => {
    expect(eventPhase("nope", null, now)).toBe("upcoming");
  });
});

describe("dateTile / monthHeading", () => {
  it("formats the tile and the group heading", () => {
    const iso = new Date(2026, 11, 5, 19, 0).toISOString();
    expect(dateTile(iso, "en-US")).toEqual({ month: "DEC", day: "5" });
    expect(monthHeading(iso, "en-US")).toBe("December 2026");
    expect(dateTile("nope")).toEqual({ month: "", day: "" });
    expect(monthHeading("nope")).toBe("No date");
  });
});
