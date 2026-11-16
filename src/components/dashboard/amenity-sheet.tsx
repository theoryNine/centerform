"use client";

import { useEffect, useId, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertAmenityAction, deleteAmenityAction } from "@/app/dashboard/venue/amenities/actions";
import { EditSheetFooter, SheetError, useEditSheet } from "@/components/dashboard/edit-sheet";
import { SheetSection, SheetShell, SwitchRow } from "@/components/dashboard/sheet-shell";
import type { AmenityCategory, VenueAmenity } from "@/types";

export const AMENITY_CATEGORIES: { value: AmenityCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "room", label: "Room" },
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "dining", label: "Dining" },
  { value: "recreation", label: "Recreation" },
  { value: "business", label: "Business" },
  { value: "wellness", label: "Wellness" },
  { value: "parking", label: "Parking" },
  { value: "accessibility", label: "Accessibility" },
  { value: "family", label: "Family" },
  { value: "safety", label: "Safety" },
  { value: "outdoor", label: "Outdoor" },
];

interface AmenitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: VenueAmenity | null;
  venueId: string;
  /** Category for a new amenity (the group whose Add button was used). */
  defaultCategory?: AmenityCategory;
}

export function AmenitySheet({
  open,
  onOpenChange,
  amenity,
  venueId,
  defaultCategory = "general",
}: AmenitySheetProps) {
  const uid = useId();
  const isEdit = amenity !== null;
  const [isAvailable, setIsAvailable] = useState(amenity?.is_available ?? true);

  useEffect(() => {
    if (open) setIsAvailable(amenity?.is_available ?? true);
  }, [open, amenity]);

  const sheet = useEditSheet({
    open,
    onOpenChange,
    save: (fd) => upsertAmenityAction(fd),
    remove: async () => {
      if (!amenity) return;
      const fd = new FormData();
      fd.set("id", amenity.id);
      fd.set("venueId", venueId);
      await deleteAmenityAction(fd);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetShell
        title={isEdit ? "Edit amenity" : "Add amenity"}
        description="Amenity name, category, note and availability."
        onSubmit={sheet.handleSubmit}
        footer={
          <EditSheetFooter
            isEdit={isEdit}
            pending={sheet.pending}
            confirmDelete={sheet.confirmDelete}
            onConfirmDelete={sheet.setConfirmDelete}
            onDelete={sheet.handleDelete}
            onCancel={() => onOpenChange(false)}
            noun="amenity"
            addLabel="Add amenity"
          />
        }
      >
        <input type="hidden" name="venueId" value={venueId} />
        {isEdit && <input type="hidden" name="id" value={amenity.id} />}
        {isEdit && <input type="hidden" name="display_order" value={amenity.display_order} />}
        {/* The sheet has no icon field; keep whatever the amenity already has (it shows on the guest page). */}
        <input type="hidden" name="icon" value={amenity?.icon ?? ""} />

        <SheetSection title="Basics">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-name`}>Name (required)</Label>
            <Input
              id={`${uid}-name`}
              name="name"
              required
              defaultValue={amenity?.name ?? ""}
              placeholder="Free Wi-Fi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-category`}>Category</Label>
            <select
              id={`${uid}-category`}
              name="category"
              defaultValue={amenity?.category ?? defaultCategory}
              className="border-input bg-background focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
            >
              {AMENITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-description`}>Note</Label>
            <Textarea
              id={`${uid}-description`}
              name="description"
              rows={2}
              defaultValue={amenity?.description ?? ""}
              placeholder="Shown under the name, e.g. Open 6am to 10pm"
            />
          </div>
        </SheetSection>

        <SheetSection title="Availability">
          <SwitchRow
            id={`${uid}-available`}
            name="is_available"
            label="Available to guests"
            hint="Turn off to hide it from the guest site."
            checked={isAvailable}
            onCheckedChange={setIsAvailable}
          />
        </SheetSection>

        <SheetError message={sheet.error} />
      </SheetShell>
    </Sheet>
  );
}
