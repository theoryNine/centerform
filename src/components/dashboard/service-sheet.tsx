"use client";

import { useRef, useState } from "react";
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
import { upsertServiceAction, deleteServiceAction } from "@/app/dashboard/venue/services/actions";
import type { Service, ServiceCategory } from "@/types";

const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEdit = service !== null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      await upsertServiceAction(fd);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!service) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", service.id);
      fd.set("venueId", venueId);
      await deleteServiceAction(fd);
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
          <SheetTitle>{isEdit ? "Edit Service" : "Add Service"}</SheetTitle>
        </SheetHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 pb-2">
          <input type="hidden" name="venueId" value={venueId} />
          {isEdit && <input type="hidden" name="id" value={service.id} />}
          {isEdit && (
            <input type="hidden" name="display_order" value={service.display_order} />
          )}

          <div className="space-y-2">
            <Label htmlFor="svc-name">Name</Label>
            <Input
              id="svc-name"
              name="name"
              required
              defaultValue={service?.name ?? ""}
              placeholder="Wi-Fi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-category">Category</Label>
            <select
              id="svc-category"
              name="category"
              defaultValue={service?.category ?? "other"}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-description">Description</Label>
            <Textarea
              id="svc-description"
              name="description"
              rows={3}
              defaultValue={service?.description ?? ""}
              placeholder="Brief summary shown to guests."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-icon">Icon</Label>
            <Input
              id="svc-icon"
              name="icon"
              defaultValue={service?.icon ?? ""}
              placeholder="wifi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-details">Details (JSON)</Label>
            <Textarea
              id="svc-details"
              name="details"
              rows={6}
              defaultValue={service?.details ? JSON.stringify(service.details, null, 2) : ""}
              placeholder='[{"type":"bullets","items":["Item 1","Item 2"]}]'
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              name="is_active"
              defaultValue={String(service?.is_active ?? true)}
              className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <Label className="text-sm text-muted-foreground">Visibility</Label>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Service"}
            </Button>
            {isEdit && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Service
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
