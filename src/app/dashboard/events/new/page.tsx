"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateEventPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [eventType, setEventType] = useState("other");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Create event via Supabase
    alert("Event creation will be connected to Supabase. Check the console for the payload.");
    console.log({ name, slug, eventType, description, startDate, endDate, address, city, state });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-muted-foreground">
          Set up a new standalone event with its own concierge experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Event Name</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. TechConnect 2026"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. techconnect-2026"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This will be your event URL: centerform.com/{slug || "your-event-slug"}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="conference">Conference</option>
                <option value="concert">Concert</option>
                <option value="festival">Festival</option>
                <option value="wedding">Wedding</option>
                <option value="gala">Gala</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell attendees about your event..."
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date &amp; Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Start Date & Time</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">End Date & Time</label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 500 Convention Center Dr"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Austin"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State</label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. TX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">Create Event</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
