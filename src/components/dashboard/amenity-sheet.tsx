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
import {
  upsertAmenityAction,
  deleteAmenityAction,
} from "@/app/dashboard/venue/amenities/actions";
import type { AmenityCategory, VenueAmenity } from "@/types";

const AMENITY_CATEGORIES: { value: AmenityCategory; label: string }[] = [
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
}

export function AmenitySheet({ open, onOpenChange, amenity, venueId }: AmenitySheetProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEdit = amenity !== null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      await upsertAmenityAction(fd);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!amenity) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", amenity.id);
      fd.set("venueId", venueId);
      await deleteAmenityAction(fd);
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
          <SheetTitle>{isEdit ? "Edit Amenity" : "Add Amenity"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 pb-2">
          <input type="hidden" name="venueId" value={venueId} />
          {isEdit && <input type="hidden" name="id" value={amenity.id} />}
          {isEdit && <input type="hidden" name="display_order" value={amenity.display_order} />}

          <div className="space-y-2">
            <Label htmlFor="am-name">Name</Label>
            <Input
              id="am-name"
              name="name"
              required
              defaultValue={amenity?.name ?? ""}
              placeholder="Free Wi-Fi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="am-category">Category</Label>
            <select
              id="am-category"
              name="category"
              defaultValue={amenity?.category ?? "general"}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {AMENITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="am-description">Description</Label>
            <Textarea
              id="am-description"
              name="description"
              rows={2}
              defaultValue={amenity?.description ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <select
              name="is_available"
              defaultValue={String(amenity?.is_available ?? true)}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Amenity"}
            </Button>
            {isEdit && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Amenity
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
