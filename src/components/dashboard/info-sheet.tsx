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
import { upsertInfoAction, deleteInfoAction } from "@/app/dashboard/venue/info/actions";
import type { InfoCategory, VenueInfo } from "@/types";

const INFO_CATEGORIES: { value: InfoCategory; label: string }[] = [
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
}

export function InfoSheet({ open, onOpenChange, info, venueId }: InfoSheetProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEdit = info !== null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      await upsertInfoAction(fd);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!info) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", info.id);
      fd.set("venueId", venueId);
      await deleteInfoAction(fd);
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
          <SheetTitle>{isEdit ? "Edit Info" : "Add Info"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 pb-2">
          <input type="hidden" name="venueId" value={venueId} />
          {isEdit && <input type="hidden" name="id" value={info.id} />}
          {isEdit && <input type="hidden" name="display_order" value={info.display_order} />}

          <div className="space-y-2">
            <Label htmlFor="info-category">Category</Label>
            <select
              id="info-category"
              name="category"
              defaultValue={info?.category ?? "general"}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {INFO_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-key">Label</Label>
            <Input
              id="info-key"
              name="key"
              required
              defaultValue={info?.key ?? ""}
              placeholder="Check-in Time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-value">Value</Label>
            <Input
              id="info-value"
              name="value"
              required
              defaultValue={info?.value ?? ""}
              placeholder="3:00 PM"
            />
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Info"}
            </Button>
            {isEdit && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
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
