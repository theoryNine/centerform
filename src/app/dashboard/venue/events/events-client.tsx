"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventSheet } from "@/components/dashboard/event-sheet";
import type { VenueEvent } from "@/types";

function formatEventDate(startTime: string) {
  return new Date(startTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface EventsClientProps {
  events: VenueEvent[];
  venueId: string;
}

export function EventsClient({ events, venueId }: EventsClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<VenueEvent | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(event: VenueEvent) {
    setSelected(event);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage events for your venue and surrounding area.</p>
        </div>
        <Button onClick={openCreate}>Add Event</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {events.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No events yet. Create your first event to get started.
              </p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.is_featured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.location ? `${event.location} · ` : ""}
                      {formatEventDate(event.start_time)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.is_active ? "default" : "secondary"}>
                      {event.is_active ? "Active" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <EventSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        event={selected}
        venueId={venueId}
      />
    </div>
  );
}
