"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AmenitySheet } from "@/components/dashboard/amenity-sheet";
import { toggleAmenityAction } from "./actions";
import type { AmenityCategory, VenueAmenity } from "@/types";

const CATEGORY_LABELS: Record<AmenityCategory, string> = {
  general: "General",
  room: "Room",
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  dining: "Dining",
  recreation: "Recreation",
  business: "Business",
  wellness: "Wellness",
  parking: "Parking",
  accessibility: "Accessibility",
  family: "Family",
  safety: "Safety",
  outdoor: "Outdoor",
};

interface AmenitiesClientProps {
  amenities: VenueAmenity[];
  venueId: string;
}

export function AmenitiesClient({ amenities, venueId }: AmenitiesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<VenueAmenity | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(amenity: VenueAmenity) {
    setSelected(amenity);
    setSheetOpen(true);
  }

  function handleToggle(amenity: VenueAmenity) {
    startTransition(async () => {
      await toggleAmenityAction(amenity.id, !amenity.is_available);
    });
  }

  const grouped = amenities.reduce<Record<string, VenueAmenity[]>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Amenities</h1>
          <p className="text-muted-foreground">Feature flags and amenity details for guests.</p>
        </div>
        <Button onClick={openCreate}>Add Amenity</Button>
      </div>

      {amenities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No amenities yet. Add your first to get started.
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {CATEGORY_LABELS[category as AmenityCategory] ?? category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((amenity) => (
                  <div key={amenity.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{amenity.name}</p>
                      {amenity.description && (
                        <p className="text-xs text-muted-foreground">{amenity.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(amenity)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: amenity.is_available
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted))",
                          color: amenity.is_available
                            ? "hsl(var(--primary-foreground))"
                            : "hsl(var(--muted-foreground))",
                        }}
                      >
                        {amenity.is_available ? "Available" : "Unavailable"}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(amenity)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AmenitySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        amenity={selected}
        venueId={venueId}
      />
    </div>
  );
}
