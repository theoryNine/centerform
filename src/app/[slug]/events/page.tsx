import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const placeholderEvents = [
  {
    title: "Live Jazz Night",
    location: "Lobby Lounge",
    date: "Every Friday, 7 PM",
    featured: true,
    description: "Enjoy live jazz performances with complimentary appetizers.",
  },
  {
    title: "Wine Tasting",
    location: "The Cellar",
    date: "Sat, Feb 22 · 5 PM",
    featured: true,
    description: "Sample a curated selection of local wines with our sommelier.",
  },
  {
    title: "Morning Yoga",
    location: "Rooftop Terrace",
    date: "Daily, 7 AM",
    featured: false,
    description: "Start your day with a guided yoga session overlooking the city.",
  },
  {
    title: "Farmers Market",
    location: "City Square (0.3 mi)",
    date: "Sun, Feb 23 · 9 AM",
    featured: false,
    description: "Weekly farmers market with local produce, crafts, and food vendors.",
  },
];

export default function EventsPage() {
  return (
    <div className="py-6">
      <h1 className="text-xl font-bold">Events</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        What&apos;s happening in and around the venue.
      </p>

      <div className="mt-4 space-y-3">
        {placeholderEvents.map((event) => (
          <Card key={event.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium">{event.title}</p>
                {event.featured && <Badge className="shrink-0">Featured</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.location} · {event.date}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
