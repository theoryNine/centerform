import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const placeholderEvents = [
  { name: "TechConnect 2026", event_type: "conference", city: "Austin, TX", start_date: "Jun 15, 2026", active: true },
  { name: "Summer Sounds Festival", event_type: "festival", city: "Portland, OR", start_date: "Jul 25, 2026", active: true },
  { name: "The Anderson-Park Wedding", event_type: "wedding", city: "Savannah, GA", start_date: "Sep 12, 2026", active: true },
];

export default function ManageStandaloneEventsPage() {
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
            {placeholderEvents.map((event) => (
              <div key={event.name} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{event.name}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.event_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {event.city} &middot; {event.start_date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={event.active ? "default" : "secondary"}>
                    {event.active ? "Active" : "Draft"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
