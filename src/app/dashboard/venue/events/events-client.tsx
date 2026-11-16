"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Chip,
  DateTile,
  EmptyState,
  ListGroup,
  ListRow,
  ListSkeleton,
  ListToolbar,
  NoResults,
} from "@/components/dashboard/list-parts";
import { EventSheet } from "@/components/dashboard/event-sheet";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  dateTile,
  eventPhase,
  groupInOrder,
  matchesQuery,
  monthHeading,
  plural,
  type EventPhase,
} from "@/lib/dashboard-lists";
import type { VenueEvent } from "@/types";

type EventFilter = "all" | "upcoming" | "drafts" | "past";
const FILTERS: { key: EventFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "drafts", label: "Drafts" },
  { key: "past", label: "Past" },
];

function formatTimes(event: VenueEvent): string {
  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const start = time(event.start_time);
  return event.end_time ? `${start} – ${time(event.end_time)}` : start;
}

interface EventsClientProps {
  events: VenueEvent[];
  venueId: string;
}

export function EventsClient({ events, venueId }: EventsClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<VenueEvent | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EventFilter>("upcoming");
  const [now] = useState(() => new Date());
  // Dates, "Today" and Past depend on the viewer's clock and time zone: render them in the browser only.
  const hydrated = useHydrated();

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(event: VenueEvent) {
    setSelected(event);
    setSheetOpen(true);
  }

  const phases = useMemo(() => {
    const map = new Map<string, EventPhase>();
    for (const e of events) map.set(e.id, eventPhase(e.start_time, e.end_time, now));
    return map;
  }, [events, now]);

  const visible = events.filter((e) => {
    const phase = phases.get(e.id);
    const inFilter =
      filter === "all" ||
      (filter === "upcoming" && phase !== "past") ||
      (filter === "past" && phase === "past") ||
      (filter === "drafts" && !e.is_active);
    return inFilter && matchesQuery(search, e.title, e.location, e.description);
  });
  // Soonest first, except Past where the most recent comes first.
  const ordered = [...visible].sort((a, b) =>
    filter === "past"
      ? b.start_time.localeCompare(a.start_time)
      : a.start_time.localeCompare(b.start_time),
  );
  const groups = groupInOrder(ordered, (e) => monthHeading(e.start_time));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage events for your venue and surrounding area.
          </p>
        </div>
        <Button onClick={openCreate} className="h-10">
          Add event
        </Button>
      </div>

      {!hydrated ? (
        <ListSkeleton />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Events show in the Tonight section on your guest home page, and on the Events page. Add your first to get started."
          actionLabel="Add event"
          onAction={openCreate}
        />
      ) : (
        <>
          <ListToolbar
            search={search}
            onSearch={setSearch}
            searchLabel="Search events"
            filters={FILTERS}
            filter={filter}
            onFilter={(k) => setFilter(k as EventFilter)}
            filterLabel="Filter events"
            countText={plural(visible.length, "event")}
          />

          {visible.length === 0 ? (
            <NoResults
              query={search}
              message={
                filter === "upcoming"
                  ? "No upcoming events."
                  : filter === "drafts"
                    ? "No draft events."
                    : filter === "past"
                      ? "No past events."
                      : undefined
              }
              clearLabel="Show all events"
              onClear={() => {
                setSearch("");
                setFilter("all");
              }}
            />
          ) : (
            <div className="space-y-6">
              {groups.map(([month, items]) => (
                <ListGroup key={month} heading={month} count={items.length}>
                  {items.map((event) => {
                    const tile = dateTile(event.start_time);
                    return (
                      <ListRow
                        key={event.id}
                        title={event.title}
                        meta={[event.location, formatTimes(event)].filter(Boolean).join(" · ")}
                        leading={<DateTile month={tile.month} day={tile.day} />}
                        chips={
                          <>
                            {!event.is_active && <Chip>Draft</Chip>}
                            {event.is_featured && <Chip tone="featured">Featured</Chip>}
                            {phases.get(event.id) === "today" && <Chip tone="accent">Today</Chip>}
                          </>
                        }
                        onOpen={() => openEdit(event)}
                      />
                    );
                  })}
                </ListGroup>
              ))}
            </div>
          )}
        </>
      )}

      <EventSheet open={sheetOpen} onOpenChange={setSheetOpen} event={selected} venueId={venueId} />
    </div>
  );
}
