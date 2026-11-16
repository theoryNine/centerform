// "Finish setting up" checklist on the dashboard Overview. Pure so the rules are unit-testable;
// the page does the queries and passes the facts in.

export interface ChecklistInput {
  coverImageUrl: string | null;
  servicesCount: number;
  placesCount: number;
  collectionsCount: number;
  eventsPageImageUrl: string | null;
  welcomeBody: string | null;
}

export interface ChecklistItem {
  id: "cover" | "services" | "places" | "events-image" | "welcome";
  title: string;
  hint: string;
  done: boolean;
  href: string;
  actionLabel: string;
}

const hasText = (value: string | null | undefined) => !!value && value.trim().length > 0;

export function buildChecklist(input: ChecklistInput): ChecklistItem[] {
  return [
    {
      id: "cover",
      title: "Add a cover image",
      hint: "It is the first thing guests see.",
      done: hasText(input.coverImageUrl),
      href: "/dashboard/venue?tab=general",
      actionLabel: "Add image",
    },
    {
      id: "services",
      title: "Add your services",
      hint: "Wi-Fi, housekeeping, parking and so on.",
      done: input.servicesCount > 0,
      href: "/dashboard/venue/services",
      actionLabel: "Add services",
    },
    {
      id: "places",
      title: "Add places and collections",
      hint: "Recommendations guests can browse.",
      done: input.placesCount > 0 && input.collectionsCount > 0,
      href: "/dashboard/venue/places?type=places",
      actionLabel: "Add places",
    },
    {
      id: "events-image",
      title: "Add an image for the Events page",
      hint: "Shown at the top of the Events page.",
      done: hasText(input.eventsPageImageUrl),
      href: "/dashboard/venue?tab=images",
      actionLabel: "Add image",
    },
    {
      id: "welcome",
      title: "Write your welcome message",
      hint: "A few friendly lines on the home page.",
      done: hasText(input.welcomeBody),
      href: "/dashboard/venue?tab=general",
      actionLabel: "Write message",
    },
  ];
}
