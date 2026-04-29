"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceSheet } from "@/components/dashboard/place-sheet";
import type { ExploreCollection, NearbyPlace } from "@/types";

interface PlacesClientProps {
  places: NearbyPlace[];
  collections: ExploreCollection[];
  venueId: string;
}

export function PlacesClient({ places, collections, venueId }: PlacesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<NearbyPlace | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(place: NearbyPlace) {
    setSelected(place);
    setSheetOpen(true);
  }

  // Group by area for display
  const grouped = places.reduce<Record<string, NearbyPlace[]>>((acc, place) => {
    const key = place.area ?? "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(place);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nearby Places</h1>
          <p className="text-muted-foreground">Recommendations and explore cards for guests.</p>
        </div>
        <Button onClick={openCreate}>Add Place</Button>
      </div>

      {places.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No places yet. Add your first recommendation to get started.
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([area, areaPlaces]) => (
          <div key={area}>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {area}
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {areaPlaces.map((place) => (
                    <div key={place.id} className="flex items-center justify-between p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{place.name}</p>
                          {place.is_featured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          {place.collection_id && (
                            <Badge variant="secondary" className="text-xs">
                              Collection
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {place.category.replace(/_/g, " ")}
                          {place.tagline ? ` · ${place.tagline}` : ""}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(place)}>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))
      )}

      <PlaceSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        place={selected}
        venueId={venueId}
        collections={collections}
      />
    </div>
  );
}
