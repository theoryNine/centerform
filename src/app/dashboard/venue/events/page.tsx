import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const placeholderEvents = [
  { title: "Live Jazz Night", location: "Lobby Lounge", date: "Every Friday", active: true, featured: true },
  { title: "Wine Tasting", location: "The Cellar", date: "Feb 22, 2026", active: true, featured: true },
  { title: "Morning Yoga", location: "Rooftop Terrace", date: "Daily", active: true, featured: false },
  { title: "Art Exhibition", location: "Gallery Hall", date: "Mar 1-15, 2026", active: false, featured: false },
];

export default function ManageEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage events for your venue and surrounding area.
          </p>
        </div>
        <Button>Add Event</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {placeholderEvents.map((event) => (
              <div key={event.title} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {event.location} · {event.date}
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
