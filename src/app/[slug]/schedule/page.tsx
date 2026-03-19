"use client";

import { useSlug } from "@/components/slug-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const placeholderSchedule = [
  {
    day: "Day 1",
    items: [
      {
        title: "Registration & Welcome Coffee",
        location: "Main Lobby",
        time: "8:00 AM – 9:00 AM",
        speaker: null,
        featured: false,
      },
      {
        title: "Opening Keynote",
        location: "Grand Ballroom",
        time: "9:00 AM – 10:30 AM",
        speaker: "Dr. Sarah Chen",
        featured: true,
      },
      {
        title: "Workshop: Getting Started",
        location: "Room 201",
        time: "11:00 AM – 12:30 PM",
        speaker: "Alex Rivera",
        featured: false,
      },
      {
        title: "Networking Lunch",
        location: "Terrace",
        time: "12:30 PM – 2:00 PM",
        speaker: null,
        featured: false,
      },
      {
        title: "Panel Discussion",
        location: "Grand Ballroom",
        time: "2:00 PM – 3:30 PM",
        speaker: "Multiple speakers",
        featured: true,
      },
    ],
  },
  {
    day: "Day 2",
    items: [
      {
        title: "Morning Keynote",
        location: "Grand Ballroom",
        time: "9:00 AM – 10:00 AM",
        speaker: "James Park",
        featured: true,
      },
      {
        title: "Breakout Sessions",
        location: "Rooms 201-204",
        time: "10:30 AM – 12:00 PM",
        speaker: null,
        featured: false,
      },
      {
        title: "Closing Ceremony",
        location: "Grand Ballroom",
        time: "3:00 PM – 4:00 PM",
        speaker: null,
        featured: true,
      },
    ],
  },
];

export default function SchedulePage() {
  const resolved = useSlug();

  if (resolved.type !== "event") {
    return (
      <div className="py-6">
        <h1 className="text-xl font-bold">Schedule</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page is only available for events.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold">Schedule</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Full event schedule for {resolved.data.name}.
      </p>

      <div className="mt-6 space-y-8">
        {placeholderSchedule.map((day) => (
          <div key={day.day}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {day.day}
            </h2>
            <div className="space-y-3">
              {day.items.map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{item.title}</p>
                      {item.featured && <Badge className="shrink-0">Featured</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.location} &middot; {item.time}
                    </p>
                    {item.speaker && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Speaker: {item.speaker}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
