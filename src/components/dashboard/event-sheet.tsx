"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertVenueEventAction,
  deleteVenueEventAction,
} from "@/app/dashboard/venue/events/actions";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { EventWhenFields, type EventWhenHandle } from "@/components/dashboard/event-when-fields";
import { SheetSection, SheetShell, SwitchRow } from "@/components/dashboard/sheet-shell";
import type { VenueEvent } from "@/types";

interface EventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: VenueEvent | null;
  venueId: string;
}

export function EventSheet({ open, onOpenChange, event, venueId }: EventSheetProps) {
  const router = useRouter();
  const uid = useId();
  const whenRef = useRef<EventWhenHandle>(null);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(event?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(event?.is_featured ?? false);

  const isEdit = event !== null;

  // The sheet stays mounted between uses, so reload the switches each time it opens.
  useEffect(() => {
    if (!open) return;
    setIsActive(event?.is_active ?? true);
    setIsFeatured(event?.is_featured ?? false);
    setConfirmDelete(false);
    setError(null);
  }, [open, event]);

  function describe(err: unknown, verb: "save" | "delete" = "save") {
    const detail = err instanceof Error && err.message ? ` ${err.message}` : "";
    return process.env.NODE_ENV === "production"
      ? `Couldn't ${verb}. Try again.`
      : `Couldn't ${verb}.${detail}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Start/end checks live in the picker (it also focuses the field that needs attention).
    if (!whenRef.current?.validate()) return;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      await upsertVenueEventAction(fd);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(describe(err));
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("id", event.id);
      fd.set("venueId", venueId);
      await deleteVenueEventAction(fd);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(describe(err, "delete"));
    } finally {
      setPending(false);
      setConfirmDelete(false);
    }
  }

  const footer = confirmDelete ? (
    <>
      <p className="mr-auto text-sm font-medium">Delete this event?</p>
      <Button
        type="button"
        variant="outline"
        className="h-10"
        disabled={pending}
        onClick={() => setConfirmDelete(false)}
      >
        Keep event
      </Button>
      <Button
        type="button"
        variant="destructive"
        className="h-10"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "Deleting…" : "Confirm delete"}
      </Button>
    </>
  ) : (
    <>
      {isEdit && (
        <Button
          type="button"
          variant="ghost"
          className="mr-auto h-10 text-red-700 hover:text-red-800"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
        >
          Delete event
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        className={isEdit ? "h-10" : "ml-auto h-10"}
        disabled={pending}
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      <Button type="submit" className="h-10" disabled={pending}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add event"}
      </Button>
    </>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetShell
        title={isEdit ? "Edit event" : "Add event"}
        description="Event title, time, image and visibility."
        onSubmit={handleSubmit}
        footer={footer}
      >
        <input type="hidden" name="venueId" value={venueId} />
        {isEdit && <input type="hidden" name="id" value={event.id} />}

        <SheetSection title="Basics">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-title`}>Title (required)</Label>
            <Input
              id={`${uid}-title`}
              name="title"
              required
              defaultValue={event?.title ?? ""}
              placeholder="Live Jazz Night"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-location`}>Location</Label>
            <Input
              id={`${uid}-location`}
              name="location"
              defaultValue={event?.location ?? ""}
              placeholder="Lobby Bar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-description`}>Description</Label>
            <Textarea
              id={`${uid}-description`}
              name="description"
              rows={3}
              defaultValue={event?.description ?? ""}
            />
          </div>
        </SheetSection>

        <SheetSection title="When">
          <EventWhenFields
            ref={whenRef}
            defaultStart={event?.start_time}
            defaultEnd={event?.end_time}
          />
        </SheetSection>

        <SheetSection title="Image and booking">
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUpload
              name="image_url"
              defaultValue={event?.image_url}
              venueId={venueId}
              compact
              label="event image"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-booking`}>Booking link</Label>
            <Input
              id={`${uid}-booking`}
              name="booking_url"
              defaultValue={event?.booking_url ?? ""}
              placeholder="https://eventbrite.com/..."
              aria-describedby={`${uid}-booking-hint`}
            />
            <p id={`${uid}-booking-hint`} className="text-muted-foreground text-xs">
              Optional. Clicks on &lsquo;Book now&rsquo; are tracked.
            </p>
          </div>
        </SheetSection>

        <SheetSection title="Visibility">
          <SwitchRow
            id={`${uid}-active`}
            name="is_active"
            label="Show to guests"
            hint="Turn off to keep it as a draft."
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <SwitchRow
            id={`${uid}-featured`}
            name="is_featured"
            label="Feature this event"
            hint="Adds a Featured badge."
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
          />
        </SheetSection>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </SheetShell>
    </Sheet>
  );
}
