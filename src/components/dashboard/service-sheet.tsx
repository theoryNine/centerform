"use client";

import { useEffect, useId, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertServiceAction, deleteServiceAction } from "@/app/dashboard/venue/services/actions";
import { EditSheetFooter, SheetError, useEditSheet } from "@/components/dashboard/edit-sheet";
import { ServiceDetailsEditor } from "@/components/dashboard/service-details-editor";
import { SheetSection, SheetShell, SwitchRow } from "@/components/dashboard/sheet-shell";
import type { Service, ServiceCategory } from "@/types";

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "room_service", label: "Room Service" },
  { value: "spa", label: "Spa" },
  { value: "concierge", label: "Concierge" },
  { value: "dining", label: "Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "activities", label: "Activities" },
  { value: "other", label: "Other" },
];

interface ServiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  venueId: string;
}

export function ServiceSheet({ open, onOpenChange, service, venueId }: ServiceSheetProps) {
  const uid = useId();
  const isEdit = service !== null;
  const [isActive, setIsActive] = useState(service?.is_active ?? true);

  useEffect(() => {
    if (open) setIsActive(service?.is_active ?? true);
  }, [open, service]);

  const sheet = useEditSheet({
    open,
    onOpenChange,
    save: (fd) => upsertServiceAction(fd),
    remove: async () => {
      if (!service) return;
      const fd = new FormData();
      fd.set("id", service.id);
      fd.set("venueId", venueId);
      await deleteServiceAction(fd);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetShell
        title={isEdit ? "Edit service" : "Add service"}
        description="Service name, category, description, details and visibility."
        onSubmit={sheet.handleSubmit}
        footer={
          <EditSheetFooter
            isEdit={isEdit}
            pending={sheet.pending}
            confirmDelete={sheet.confirmDelete}
            onConfirmDelete={sheet.setConfirmDelete}
            onDelete={sheet.handleDelete}
            onCancel={() => onOpenChange(false)}
            noun="service"
            addLabel="Add service"
          />
        }
      >
        <input type="hidden" name="venueId" value={venueId} />
        {isEdit && <input type="hidden" name="id" value={service.id} />}
        {isEdit && <input type="hidden" name="display_order" value={service.display_order} />}
        {/* The sheet has no icon field; keep whatever the service already has. */}
        <input type="hidden" name="icon" value={service?.icon ?? ""} />

        <SheetSection title="Basics">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-name`}>Name (required)</Label>
            <Input
              id={`${uid}-name`}
              name="name"
              required
              defaultValue={service?.name ?? ""}
              placeholder="Wi-Fi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-category`}>Category</Label>
            <select
              id={`${uid}-category`}
              name="category"
              defaultValue={service?.category ?? "other"}
              className="border-input bg-background focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-description`}>Description</Label>
            <Textarea
              id={`${uid}-description`}
              name="description"
              rows={3}
              defaultValue={service?.description ?? ""}
              placeholder="Brief summary shown to guests."
            />
          </div>
        </SheetSection>

        <SheetSection title="Details">
          <ServiceDetailsEditor defaultValue={service?.details ?? null} />
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
        </SheetSection>

        <SheetError message={sheet.error} />
      </SheetShell>
    </Sheet>
  );
}
