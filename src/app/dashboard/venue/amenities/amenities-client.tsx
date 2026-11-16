"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/dashboard/list-parts";
import { AMENITY_CATEGORIES, AmenitySheet } from "@/components/dashboard/amenity-sheet";
import { toast } from "@/components/dashboard/toaster";
import { groupInOrder, humanize } from "@/lib/dashboard-lists";
import { toggleAmenityAction } from "./actions";
import type { AmenityCategory, VenueAmenity } from "@/types";

const categoryLabel = (c: string) =>
  AMENITY_CATEGORIES.find((x) => x.value === c)?.label ?? humanize(c);

interface AmenitiesClientProps {
  amenities: VenueAmenity[];
  venueId: string;
}

export function AmenitiesClient({ amenities: initial, venueId }: AmenitiesClientProps) {
  const router = useRouter();
  const [amenities, setAmenities] = useState(initial);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<VenueAmenity | null>(null);
  const [newCategory, setNewCategory] = useState<AmenityCategory>("general");

  // Follow the server after a refresh (an add, edit or delete).
  useEffect(() => setAmenities(initial), [initial]);

  function openCreate(category: AmenityCategory = "general") {
    setSelected(null);
    setNewCategory(category);
    setSheetOpen(true);
  }

  function openEdit(amenity: VenueAmenity) {
    setSelected(amenity);
    setSheetOpen(true);
  }

  async function toggle(amenity: VenueAmenity, next: boolean) {
    // Optimistic: flip it now, put it back (with a message) if the save fails.
    setAmenities((prev) =>
      prev.map((a) => (a.id === amenity.id ? { ...a, is_available: next } : a)),
    );
    setSaving((prev) => new Set(prev).add(amenity.id));
    try {
      await toggleAmenityAction(amenity.id, next);
      router.refresh();
    } catch {
      setAmenities((prev) =>
        prev.map((a) => (a.id === amenity.id ? { ...a, is_available: !next } : a)),
      );
      toast(`Couldn't update ${amenity.name}. Try again.`, "error");
    } finally {
      setSaving((prev) => {
        const copy = new Set(prev);
        copy.delete(amenity.id);
        return copy;
      });
    }
  }

  const groups = groupInOrder(amenities, (a) => a.category);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Amenities</h1>
          <p className="text-muted-foreground">Switch an amenity off to hide it from guests.</p>
        </div>
        <Button onClick={() => openCreate()} className="h-10">
          Add amenity
        </Button>
      </div>

      {amenities.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No amenities yet"
          description="Amenities are the features guests can count on, like free Wi-Fi, a pool or parking. They appear on your guest site."
          actionLabel="Add amenity"
          onAction={() => openCreate()}
        />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {groups.map(([category, items]) => {
            const available = items.filter((a) => a.is_available).length;
            return (
              <Card key={category} className="gap-0 py-0">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-3">
                  <div>
                    <CardTitle>
                      <h2 className="text-base">{categoryLabel(category)}</h2>
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {available} of {items.length} available
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10"
                    aria-label={`Add to ${categoryLabel(category)}`}
                    onClick={() => openCreate(category as AmenityCategory)}
                  >
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {items.map((amenity) => (
                      <li key={amenity.id} className="flex items-center gap-3 px-4">
                        <button
                          type="button"
                          onClick={() => openEdit(amenity)}
                          className="focus-visible:ring-primary min-h-11 min-w-0 flex-1 rounded-md py-1 text-left outline-none hover:underline focus-visible:ring-2"
                        >
                          <span
                            className={`block truncate text-sm font-medium ${
                              amenity.is_available ? "" : "text-muted-foreground"
                            }`}
                          >
                            {amenity.name}
                          </span>
                          {amenity.description && (
                            <span className="text-muted-foreground block truncate text-xs">
                              {amenity.description}
                            </span>
                          )}
                        </button>
                        <Switch
                          checked={amenity.is_available}
                          disabled={saving.has(amenity.id)}
                          aria-busy={saving.has(amenity.id)}
                          aria-label={`${amenity.name} available to guests`}
                          onCheckedChange={(next) => toggle(amenity, next)}
                        />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AmenitySheet
        key={selected?.id ?? `new-${newCategory}`}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        amenity={selected}
        venueId={venueId}
        defaultCategory={newCategory}
      />
    </div>
  );
}
