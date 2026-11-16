import { describe, expect, it } from "vitest";
import { buildChecklist, type ChecklistInput } from "./dashboard-checklist";

const empty: ChecklistInput = {
  coverImageUrl: null,
  servicesCount: 0,
  placesCount: 0,
  collectionsCount: 0,
  eventsPageImageUrl: null,
  welcomeBody: null,
};

const doneIds = (input: ChecklistInput) =>
  buildChecklist(input)
    .filter((i) => i.done)
    .map((i) => i.id);

describe("buildChecklist", () => {
  it("is all open for a new venue", () => {
    expect(buildChecklist(empty)).toHaveLength(5);
    expect(doneIds(empty)).toEqual([]);
  });

  it("marks items done from the facts", () => {
    expect(
      doneIds({
        coverImageUrl: "https://x.test/a.webp",
        servicesCount: 3,
        placesCount: 4,
        collectionsCount: 1,
        eventsPageImageUrl: "https://x.test/e.webp",
        welcomeBody: "Hello",
      }),
    ).toEqual(["cover", "services", "places", "events-image", "welcome"]);
  });

  it("needs both places and collections for the places item", () => {
    expect(doneIds({ ...empty, placesCount: 5 })).toEqual([]);
    expect(doneIds({ ...empty, collectionsCount: 2 })).toEqual([]);
    expect(doneIds({ ...empty, placesCount: 5, collectionsCount: 2 })).toEqual(["places"]);
  });

  it("treats blank or whitespace-only text as not done", () => {
    expect(doneIds({ ...empty, welcomeBody: "   " })).toEqual([]);
    expect(doneIds({ ...empty, coverImageUrl: "" })).toEqual([]);
  });

  it("links image items to the right Hotel Info tab", () => {
    const items = Object.fromEntries(buildChecklist(empty).map((i) => [i.id, i.href]));
    expect(items["events-image"]).toBe("/dashboard/venue?tab=images");
    expect(items["welcome"]).toBe("/dashboard/venue?tab=general");
  });
});
