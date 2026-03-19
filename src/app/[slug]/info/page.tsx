"use client";

import { useSlug } from "@/components/slug-context";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Phone, Mail, Globe, Clock } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InfoPage() {
  const resolved = useSlug();

  if (resolved.type !== "event") {
    return (
      <div className="py-6">
        <h1 className="text-xl font-bold">Info</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page is only available for events.
        </p>
      </div>
    );
  }

  const event = resolved.data;
  const locationParts = [event.address, event.city, event.state, event.country].filter(Boolean);

  const details = [
    {
      icon: Calendar,
      label: "Start",
      value: `${formatDate(event.start_date)} at ${formatTime(event.start_date)}`,
    },
    event.end_date
      ? {
          icon: Clock,
          label: "End",
          value: `${formatDate(event.end_date)} at ${formatTime(event.end_date)}`,
        }
      : null,
    locationParts.length > 0
      ? { icon: MapPin, label: "Location", value: locationParts.join(", ") }
      : null,
    event.phone ? { icon: Phone, label: "Phone", value: event.phone } : null,
    event.email ? { icon: Mail, label: "Email", value: event.email } : null,
    event.website ? { icon: Globe, label: "Website", value: event.website } : null,
  ].filter(Boolean) as { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }[];

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold">{event.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Event information and details.</p>

      {event.description && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h2>
            <p className="text-sm leading-relaxed">{event.description}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardContent className="p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h2>
          <div className="space-y-4">
            {details.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon size={15} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
