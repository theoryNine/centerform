"use client";

import { useEffect, useId, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertPlaceAction, deletePlaceAction } from "@/app/dashboard/venue/places/actions";
import { EditSheetFooter, SheetError, useEditSheet } from "@/components/dashboard/edit-sheet";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { SegmentedControl } from "@/components/dashboard/segmented-control";
import { SheetSection, SheetShell, SwitchRow } from "@/components/dashboard/sheet-shell";
import type { ExploreCollection, NearbyPlace, PlaceCategory } from "@/types";

const DINING_CATEGORIES: PlaceCategory[] = ["restaurant", "bar", "cafe"];

export const PLACE_CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "cafe", label: "Café" },
  { value: "attraction", label: "Attraction" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "outdoors", label: "Outdoors" },
  { value: "other", label: "Other" },
];

// price_level is stored as 0-4 (0 = free) or empty. The segments write the same numbers.
const PRICE_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "0", label: "Free" },
  { value: "1", label: "$" },
  { value: "2", label: "$$" },
  { value: "3", label: "$$$" },
  { value: "4", label: "$$$$" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "Nearby" },
  { value: "on-site", label: "At the hotel" },
];

interface PlaceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: NearbyPlace | null;
  venueId: string;
  collections: ExploreCollection[];
  /** Category for a new place (Dining pages start on Restaurant, Nearby on Attraction). */
  defaultCategory?: PlaceCategory;
}

export function PlaceSheet({
  open,
  onOpenChange,
  place,
  venueId,
  collections,
  defaultCategory = "restaurant",
}: PlaceSheetProps) {
  const uid = useId();
  const isEdit = place !== null;
  const [category, setCategory] = useState<PlaceCategory>(place?.category ?? defaultCategory);
  const [price, setPrice] = useState(place?.price_level == null ? "" : String(place.price_level));
  const [location, setLocation] = useState(place?.area === "on-site" ? "on-site" : "");
  const [isFeatured, setIsFeatured] = useState(place?.is_featured ?? false);
  const isDining = DINING_CATEGORIES.includes(category);

  // The sheet stays mounted between uses: load the place being edited each time it opens.
  useEffect(() => {
    if (!open) return;
    setCategory(place?.category ?? defaultCategory);
    setPrice(place?.price_level == null ? "" : String(place.price_level));
    setLocation(place?.area === "on-site" ? "on-site" : "");
    setIsFeatured(place?.is_featured ?? false);
  }, [open, place, defaultCategory]);

  const sheet = useEditSheet({
    open,
    onOpenChange,
    save: (fd) => upsertPlaceAction(fd),
    remove: async () => {
      if (!place) return;
      const fd = new FormData();
      fd.set("id", place.id);
      fd.set("venueId", venueId);
      await deletePlaceAction(fd);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetShell
        title={isEdit ? "Edit place" : "Add place"}
        description="Place details, location, contact and booking, image and collection."
        onSubmit={sheet.handleSubmit}
        footer={
          <EditSheetFooter
            isEdit={isEdit}
            pending={sheet.pending}
            confirmDelete={sheet.confirmDelete}
            onConfirmDelete={sheet.setConfirmDelete}
            onDelete={sheet.handleDelete}
            onCancel={() => onOpenChange(false)}
            noun="place"
            addLabel="Add place"
          />
        }
      >
        <input type="hidden" name="venueId" value={venueId} />
        {isEdit && <input type="hidden" name="id" value={place.id} />}
        {isEdit && <input type="hidden" name="display_order" value={place.display_order} />}

        <SheetSection title="Basics">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-name`}>Name (required)</Label>
            <Input id={`${uid}-name`} name="name" required defaultValue={place?.name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-category`}>Category</Label>
            <select
              id={`${uid}-category`}
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategory)}
              className="border-input bg-background focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
            >
              {PLACE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-tagline`}>Tagline</Label>
            <Input
              id={`${uid}-tagline`}
              name="tagline"
              defaultValue={place?.tagline ?? ""}
              placeholder="Short descriptor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-description`}>Description</Label>
            <Textarea
              id={`${uid}-description`}
              name="description"
              rows={3}
              defaultValue={place?.description ?? ""}
            />
          </div>
        </SheetSection>

        <SheetSection title="Location">
          {isDining ? (
            <div className="space-y-2">
              <p className="text-sm leading-none font-medium">Where is it?</p>
              <SegmentedControl
                name="area"
                label="Where is it?"
                options={LOCATION_OPTIONS}
                value={location}
                onValueChange={setLocation}
              />
              <p className="text-muted-foreground text-xs">
                &ldquo;At the hotel&rdquo; places appear in the At the Hotel section of the Dining
                page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`${uid}-area`}>Area</Label>
                <Input
                  id={`${uid}-area`}
                  name="area"
                  defaultValue={place?.area ?? ""}
                  placeholder="Capitol Hill"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${uid}-area-order`}>Area order</Label>
                <Input
                  id={`${uid}-area-order`}
                  name="area_display_order"
                  type="number"
                  defaultValue={place?.area_display_order ?? 0}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`${uid}-address`}>Address</Label>
            <Input id={`${uid}-address`} name="address" defaultValue={place?.address ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-distance`}>Distance</Label>
            <Input
              id={`${uid}-distance`}
              name="distance"
              defaultValue={place?.distance ?? ""}
              placeholder="0.3 mi"
            />
          </div>
        </SheetSection>

        <SheetSection title="Details">
          <div className="space-y-2">
            <p className="text-sm leading-none font-medium">Price level</p>
            <SegmentedControl
              name="price_level"
              label="Price level"
              options={PRICE_OPTIONS}
              value={price}
              onValueChange={setPrice}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-rating`}>Rating (0 to 5)</Label>
            <Input
              id={`${uid}-rating`}
              name="rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              defaultValue={place?.rating ?? ""}
              placeholder="4.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-hours`}>Hours</Label>
            <Textarea
              id={`${uid}-hours`}
              name="hours"
              rows={2}
              defaultValue={place?.hours ?? ""}
              placeholder="Mon–Fri 9am–10pm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-tips`}>Tips (one per line)</Label>
            <Textarea
              id={`${uid}-tips`}
              name="tips"
              rows={3}
              defaultValue={place?.tips?.join("\n") ?? ""}
              placeholder={"Ask for the patio\nTry the happy hour menu"}
            />
          </div>
        </SheetSection>

        <SheetSection title="Contact and booking">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-phone`}>Phone</Label>
            <Input id={`${uid}-phone`} name="phone" type="tel" defaultValue={place?.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-website`}>Website</Label>
            <Input
              id={`${uid}-website`}
              name="website"
              defaultValue={place?.website ?? ""}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-cta`}>Button label</Label>
            <Input
              id={`${uid}-cta`}
              name="cta_label"
              defaultValue={place?.cta_label ?? ""}
              placeholder="Reserve a Table"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-booking`}>Booking link</Label>
            <Input
              id={`${uid}-booking`}
              name="booking_url"
              defaultValue={place?.booking_url ?? ""}
              placeholder="https://resy.com/..."
              aria-describedby={`${uid}-booking-hint`}
            />
            <p id={`${uid}-booking-hint`} className="text-muted-foreground text-xs">
              Optional. Clicks on the button are tracked.
            </p>
          </div>
        </SheetSection>

        <SheetSection title="Media and collection">
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUpload
              name="image_url"
              defaultValue={place?.image_url}
              venueId={venueId}
              compact
              label="place image"
            />
          </div>
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={`${uid}-collection`}>Link to a collection</Label>
              <select
                id={`${uid}-collection`}
                name="collection_id"
                defaultValue={place?.collection_id ?? ""}
                className="border-input bg-background focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
              >
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <SwitchRow
            id={`${uid}-featured`}
            name="is_featured"
            label="Feature this place"
            hint="Adds a Featured badge."
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
          />
        </SheetSection>

        <SheetError message={sheet.error} />
      </SheetShell>
    </Sheet>
  );
}
