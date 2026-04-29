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
  upsertVenueEventAction,
  deleteVenueEventAction,
} from "@/app/dashboard/venue/events/actions";
import type { VenueEvent } from "@/types";

interface EventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: VenueEvent | null;
  venueId: string;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function EventSheet({ open, onOpenChange, event, venueId }: EventSheetProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEdit = event !== null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      await upsertVenueEventAction(fd);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", event.id);
      fd.set("venueId", venueId);
      await deleteVenueEventAction(fd);
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
          <SheetTitle>{isEdit ? "Edit Event" : "Add Event"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 pb-2">
          <input type="hidden" name="venueId" value={venueId} />
          {isEdit && <input type="hidden" name="id" value={event.id} />}

          <div className="space-y-2">
            <Label htmlFor="evt-title">Title</Label>
            <Input
              id="evt-title"
              name="title"
              required
              defaultValue={event?.title ?? ""}
              placeholder="Live Jazz Night"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evt-location">Location</Label>
            <Input
              id="evt-location"
              name="location"
              defaultValue={event?.location ?? ""}
              placeholder="Lobby Bar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evt-description">Description</Label>
            <Textarea
              id="evt-description"
              name="description"
              rows={3}
              defaultValue={event?.description ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evt-start">Start Time</Label>
            <Input
              id="evt-start"
              name="start_time"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(event?.start_time)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evt-end">End Time</Label>
            <Input
              id="evt-end"
              name="end_time"
              type="datetime-local"
              defaultValue={toDatetimeLocal(event?.end_time)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evt-image">Image URL</Label>
            <Input
              id="evt-image"
              name="image_url"
              defaultValue={event?.image_url ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <select
                name="is_active"
                defaultValue={String(event?.is_active ?? true)}
                className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="true">Active</option>
                <option value="false">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                name="is_featured"
                defaultValue={String(event?.is_featured ?? false)}
                className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="false">Not Featured</option>
                <option value="true">Featured</option>
              </select>
            </div>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Event"}
            </Button>
            {isEdit && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Event
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
