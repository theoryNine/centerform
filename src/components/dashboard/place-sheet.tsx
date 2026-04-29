"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertPlaceAction, deletePlaceAction } from "@/app/dashboard/venue/places/actions";
import type { ExploreCollection, NearbyPlace, PlaceCategory } from "@/types";

const PLACE_CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "cafe", label: "Café" },
  { value: "attraction", label: "Attraction" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "outdoors", label: "Outdoors" },
  { value: "other", label: "Other" },
];

interface PlaceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: NearbyPlace | null;
  venueId: string;
  collections: ExploreCollection[];
}

export function PlaceSheet({ open, onOpenChange, place, venueId, collections }: PlaceSheetProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEdit = place !== null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      await upsertPlaceAction(fd);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!place) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", place.id);
      fd.set("venueId", venueId);
      await deletePlaceAction(fd);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
      setConfirmDelete(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); setConfirmDelete(false); }}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Place" : "Add Place"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 pb-2">
          <input type="hidden" name="venueId" value={venueId} />
          {isEdit && <input type="hidden" name="id" value={place.id} />}
          {isEdit && <input type="hidden" name="display_order" value={place.display_order} />}

          <div className="space-y-2">
            <Label htmlFor="pl-name">Name</Label>
            <Input id="pl-name" name="name" required defaultValue={place?.name ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-category">Category</Label>
            <select
              id="pl-category"
              name="category"
              defaultValue={place?.category ?? "restaurant"}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {PLACE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-tagline">Tagline</Label>
            <Input
              id="pl-tagline"
              name="tagline"
              defaultValue={place?.tagline ?? ""}
              placeholder="Short descriptor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-description">Description</Label>
            <Textarea
              id="pl-description"
              name="description"
              rows={3}
              defaultValue={place?.description ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pl-area">Area</Label>
              <Input
                id="pl-area"
                name="area"
                defaultValue={place?.area ?? ""}
                placeholder="Capitol Hill"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-area-order">Area Order</Label>
              <Input
                id="pl-area-order"
                name="area_display_order"
                type="number"
                defaultValue={place?.area_display_order ?? 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-address">Address</Label>
            <Input id="pl-address" name="address" defaultValue={place?.address ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pl-distance">Distance</Label>
              <Input
                id="pl-distance"
                name="distance"
                defaultValue={place?.distance ?? ""}
                placeholder="0.3 mi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-price">Price Level</Label>
              <Input
                id="pl-price"
                name="price_level"
                type="number"
                min={0}
                max={4}
                defaultValue={place?.price_level ?? ""}
                placeholder="0–4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pl-phone">Phone</Label>
              <Input id="pl-phone" name="phone" defaultValue={place?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-rating">Rating</Label>
              <Input
                id="pl-rating"
                name="rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                defaultValue={place?.rating ?? ""}
                placeholder="4.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-website">Website</Label>
            <Input
              id="pl-website"
              name="website"
              defaultValue={place?.website ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-image">Image URL</Label>
            <Input
              id="pl-image"
              name="image_url"
              defaultValue={place?.image_url ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-hours">Hours</Label>
            <Textarea
              id="pl-hours"
              name="hours"
              rows={2}
              defaultValue={place?.hours ?? ""}
              placeholder="Mon–Fri 9am–10pm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-tips">Tips (one per line)</Label>
            <Textarea
              id="pl-tips"
              name="tips"
              rows={3}
              defaultValue={place?.tips?.join("\n") ?? ""}
              placeholder="Ask for the patio&#10;Try the happy hour menu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-cta">CTA Label</Label>
            <Input
              id="pl-cta"
              name="cta_label"
              defaultValue={place?.cta_label ?? ""}
              placeholder="Reserve a Table"
            />
          </div>

          {collections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="pl-collection">Link to Collection</Label>
              <select
                id="pl-collection"
                name="collection_id"
                defaultValue={place?.collection_id ?? ""}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">— None —</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4">
            <select
              name="is_featured"
              defaultValue={String(place?.is_featured ?? false)}
              className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="false">Not Featured</option>
              <option value="true">Featured</option>
            </select>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Place"}
            </Button>
            {isEdit && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Place
              </Button>
            )}
            {isEdit && confirmDelete && (
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  disabled={pending}
                  onClick={handleDelete}
                >
                  Confirm Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
