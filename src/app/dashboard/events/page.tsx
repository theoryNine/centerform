import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllStandaloneEvents } from "@/lib/queries";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ManageStandaloneEventsPage() {
  const events = await getAllStandaloneEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Standalone Events</h1>
          <p className="text-muted-foreground">
            Manage your standalone events with their own concierge experience.
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/events/new">Create Event</a>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {events.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No standalone events yet. Create your first event to get started.
              </p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{event.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.event_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.city}{event.state ? `, ${event.state}` : ""} &middot; {formatDate(event.start_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.is_active ? "default" : "secondary"}>
                      {event.is_active ? "Active" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
