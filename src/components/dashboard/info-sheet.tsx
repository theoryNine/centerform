"use client";

import { useId } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertInfoAction, deleteInfoAction } from "@/app/dashboard/venue/info/actions";
import { EditSheetFooter, SheetError, useEditSheet } from "@/components/dashboard/edit-sheet";
import { SheetSection, SheetShell } from "@/components/dashboard/sheet-shell";
import type { InfoCategory, VenueInfo } from "@/types";

export const INFO_CATEGORIES: { value: InfoCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "policies", label: "Policies" },
  { value: "hours", label: "Hours" },
  { value: "payments", label: "Payments" },
];

interface InfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  info: VenueInfo | null;
  venueId: string;
  /** Group for a new item: the group whose Add button was used. (There is no category picker.) */
  category?: InfoCategory;
}

export function InfoSheet({
  open,
  onOpenChange,
  info,
  venueId,
  category = "general",
}: InfoSheetProps) {
  const uid = useId();
  const isEdit = info !== null;
  const group = info?.category ?? category;
  const groupLabel = INFO_CATEGORIES.find((c) => c.value === group)?.label ?? group;

  const sheet = useEditSheet({
    open,
    onOpenChange,
    save: (fd) => upsertInfoAction(fd),
    remove: async () => {
      if (!info) return;
      const fd = new FormData();
      fd.set("id", info.id);
      fd.set("venueId", venueId);
      await deleteInfoAction(fd);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetShell
        title={isEdit ? "Edit detail" : `Add to ${groupLabel}`}
        description="A label and value shown to guests, such as Check-in time."
        onSubmit={sheet.handleSubmit}
        footer={
          <EditSheetFooter
            isEdit={isEdit}
            pending={sheet.pending}
            confirmDelete={sheet.confirmDelete}
            onConfirmDelete={sheet.setConfirmDelete}
            onDelete={sheet.handleDelete}
            onCancel={() => onOpenChange(false)}
            noun="detail"
            addLabel="Add detail"
          />
        }
      >
        <input type="hidden" name="venueId" value={venueId} />
        <input type="hidden" name="category" value={group} />
        {isEdit && <input type="hidden" name="id" value={info.id} />}
        {isEdit && <input type="hidden" name="display_order" value={info.display_order} />}

        <SheetSection title={groupLabel}>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-key`}>Label (required)</Label>
            <Input
              id={`${uid}-key`}
              name="key"
              required
              defaultValue={info?.key ?? ""}
              placeholder="Check-in Time"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-value`}>Value (required)</Label>
            <Input
              id={`${uid}-value`}
              name="value"
              required
              defaultValue={info?.value ?? ""}
              placeholder="3:00 PM"
            />
          </div>
        </SheetSection>

        <SheetError message={sheet.error} />
      </SheetShell>
    </Sheet>
  );
}
