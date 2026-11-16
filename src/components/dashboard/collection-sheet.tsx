"use client";

import { useEffect, useId, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertCollectionAction,
  deleteCollectionAction,
} from "@/app/dashboard/venue/explore/actions";
import { EditSheetFooter, SheetError, useEditSheet } from "@/components/dashboard/edit-sheet";
import { SegmentedControl } from "@/components/dashboard/segmented-control";
import { SheetSection, SheetShell, SwitchRow } from "@/components/dashboard/sheet-shell";
import type { CollectionLayout, ExploreCollection } from "@/types";

const LAYOUT_OPTIONS = [
  { value: "cards", label: "Cards" },
  { value: "timeline", label: "Timeline" },
];

interface CollectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: ExploreCollection | null;
  venueId: string;
}

export function CollectionSheet({ open, onOpenChange, collection, venueId }: CollectionSheetProps) {
  const uid = useId();
  const isEdit = collection !== null;
  const [layout, setLayout] = useState<CollectionLayout>(collection?.layout ?? "cards");
  const [isActive, setIsActive] = useState(collection?.is_active ?? true);

  useEffect(() => {
    if (!open) return;
    setLayout(collection?.layout ?? "cards");
    setIsActive(collection?.is_active ?? true);
  }, [open, collection]);

  const sheet = useEditSheet({
    open,
    onOpenChange,
    save: (fd) => upsertCollectionAction(fd),
    remove: async () => {
      if (!collection) return;
      const fd = new FormData();
      fd.set("id", collection.id);
      fd.set("venueId", venueId);
      await deleteCollectionAction(fd);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetShell
        title={isEdit ? "Edit collection" : "New collection"}
        description="Collection title, layout, area and visibility."
        onSubmit={sheet.handleSubmit}
        footer={
          <EditSheetFooter
            isEdit={isEdit}
            pending={sheet.pending}
            confirmDelete={sheet.confirmDelete}
            onConfirmDelete={sheet.setConfirmDelete}
            onDelete={sheet.handleDelete}
            onCancel={() => onOpenChange(false)}
            noun="collection"
            addLabel="Create collection"
          />
        }
      >
        <input type="hidden" name="venueId" value={venueId} />
        {isEdit && <input type="hidden" name="id" value={collection.id} />}
        {isEdit && <input type="hidden" name="display_order" value={collection.display_order} />}

        <SheetSection title="Basics">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-title`}>Title (required)</Label>
            <Input
              id={`${uid}-title`}
              name="title"
              required
              defaultValue={collection?.title ?? ""}
              placeholder="Date Night"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-subtitle`}>Subtitle</Label>
            <Input
              id={`${uid}-subtitle`}
              name="subtitle"
              defaultValue={collection?.subtitle ?? ""}
              placeholder="Romantic spots near the hotel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-description`}>Description</Label>
            <Textarea
              id={`${uid}-description`}
              name="description"
              rows={3}
              defaultValue={collection?.description ?? ""}
            />
          </div>
        </SheetSection>

        <SheetSection title="Layout and area">
          <div className="space-y-2">
            <p className="text-sm leading-none font-medium">Layout</p>
            <SegmentedControl
              name="layout"
              label="Layout"
              options={LAYOUT_OPTIONS}
              value={layout}
              onValueChange={(v) => setLayout(v as CollectionLayout)}
            />
            <p className="text-muted-foreground text-xs">
              Cards are stacked photos. Timeline is a step-by-step itinerary.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-area`}>Area</Label>
            <Input
              id={`${uid}-area`}
              name="area"
              defaultValue={collection?.area ?? ""}
              placeholder="Capitol Hill"
            />
          </div>
        </SheetSection>

        <SheetSection title="Visibility">
          <SwitchRow
            id={`${uid}-active`}
            name="is_active"
            label="Show to guests"
            hint="Turn off to hide it from the Explore page."
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </SheetSection>

        <SheetError message={sheet.error} />
      </SheetShell>
    </Sheet>
  );
}
