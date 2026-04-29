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
  upsertCollectionAction,
  deleteCollectionAction,
} from "@/app/dashboard/venue/explore/actions";
import type { ExploreCollection } from "@/types";

interface CollectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: ExploreCollection | null;
  venueId: string;
}

export function CollectionSheet({
  open,
  onOpenChange,
  collection,
  venueId,
}: CollectionSheetProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEdit = collection !== null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      await upsertCollectionAction(fd);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!collection) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", collection.id);
      fd.set("venueId", venueId);
      await deleteCollectionAction(fd);
      onOpenChange(false);
      router.push("/dashboard/venue/explore");
    } finally {
      setPending(false);
      setConfirmDelete(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); setConfirmDelete(false); }}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Collection" : "New Collection"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 pb-2">
          <input type="hidden" name="venueId" value={venueId} />
          {isEdit && <input type="hidden" name="id" value={collection.id} />}
          {isEdit && (
            <input type="hidden" name="display_order" value={collection.display_order} />
          )}

          <div className="space-y-2">
            <Label htmlFor="col-title">Title</Label>
            <Input
              id="col-title"
              name="title"
              required
              defaultValue={collection?.title ?? ""}
              placeholder="Date Night"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-subtitle">Subtitle</Label>
            <Input
              id="col-subtitle"
              name="subtitle"
              defaultValue={collection?.subtitle ?? ""}
              placeholder="Romantic spots near the hotel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-description">Description</Label>
            <Textarea
              id="col-description"
              name="description"
              rows={3}
              defaultValue={collection?.description ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-area">Area</Label>
            <Input
              id="col-area"
              name="area"
              defaultValue={collection?.area ?? ""}
              placeholder="Capitol Hill"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-layout">Layout</Label>
            <select
              id="col-layout"
              name="layout"
              defaultValue={collection?.layout ?? "cards"}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="cards">Cards</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <select
              name="is_active"
              defaultValue={String(collection?.is_active ?? true)}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Collection"}
            </Button>
            {isEdit && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Collection
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
