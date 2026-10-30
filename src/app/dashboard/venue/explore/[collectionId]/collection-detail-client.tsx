"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CollectionSheet } from "@/components/dashboard/collection-sheet";
import {
  upsertCollectionItemAction,
  removeCollectionItemAction,
  reorderCollectionItemsAction,
} from "./actions";
import type { CollectionItemWithPlace, ExploreCollection, NearbyPlace } from "@/types";

interface CollectionDetailClientProps {
  collection: ExploreCollection;
  items: CollectionItemWithPlace[];
  places: NearbyPlace[];
  venueId: string;
}

export function CollectionDetailClient({
  collection,
  items,
  places,
  venueId,
}: CollectionDetailClientProps) {
  const router = useRouter();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<CollectionItemWithPlace | null>(null);
  const [pending, setPending] = useState(false);

  const addedPlaceIds = new Set(items.map((i) => i.place_id));
  const availablePlaces = places.filter((p) => !addedPlaceIds.has(p.id));

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("venueId", venueId);
      fd.set("collectionId", collection.id);
      await upsertCollectionItemAction(fd);
      setAddSheetOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleEditItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("venueId", venueId);
      fd.set("collectionId", collection.id);
      await upsertCollectionItemAction(fd);
      setEditItem(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleRemove(itemId: string) {
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", itemId);
      fd.set("venueId", venueId);
      fd.set("collectionId", collection.id);
      await removeCollectionItemAction(fd);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setPending(true);
    try {
      await reorderCollectionItemsAction(
        venueId,
        collection.id,
        reordered.map((i) => i.id)
      );
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/venue/explore">← Collections</Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{collection.title}</h1>
          <p className="text-muted-foreground">
            {collection.layout} layout · {items.length}{" "}
            {items.length === 1 ? "place" : "places"}
            {collection.area ? ` · ${collection.area}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditSheetOpen(true)}>
            Edit Collection
          </Button>
          {availablePlaces.length > 0 && (
            <Button onClick={() => setAddSheetOpen(true)}>Add Place</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Places</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No places yet. Add one to get started.
              </p>
            ) : (
              items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      disabled={index === 0 || pending}
                      onClick={() => handleReorder(index, index - 1)}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      disabled={index === items.length - 1 || pending}
                      onClick={() => handleReorder(index, index + 1)}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.place.name}</p>
                      {item.is_start && <Badge variant="outline" className="text-xs">Start</Badge>}
                      {item.is_end && <Badge variant="outline" className="text-xs">End</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.place.category}
                      {item.time_label ? ` · ${item.time_label}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditItem(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={pending}
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit collection metadata */}
      <CollectionSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        collection={collection}
        venueId={venueId}
      />

      {/* Add place sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Add Place</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddItem} className="flex flex-col gap-4 px-4 pb-2">
            <div className="space-y-2">
              <Label htmlFor="add-place">Place</Label>
              <select
                id="add-place"
                name="place_id"
                required
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">Select a place…</option>
                {availablePlaces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.area ? `(${p.area})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-time">Time Label</Label>
              <Input id="add-time" name="time_label" placeholder="8:30pm" />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <select
                  name="is_start"
                  defaultValue="false"
                  className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none"
                >
                  <option value="false">Normal</option>
                  <option value="true">Is Start</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  name="is_end"
                  defaultValue="false"
                  className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none"
                >
                  <option value="false">Normal</option>
                  <option value="true">Is End</option>
                </select>
              </div>
            </div>
            <SheetFooter className="px-0">
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Adding…" : "Add Place"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit item sheet */}
      <Sheet open={editItem !== null} onOpenChange={(v) => !v && setEditItem(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit Item — {editItem?.place.name}</SheetTitle>
          </SheetHeader>
          {editItem && (
            <form onSubmit={handleEditItem} className="flex flex-col gap-4 px-4 pb-2">
              <input type="hidden" name="id" value={editItem.id} />
              <input type="hidden" name="place_id" value={editItem.place_id} />
              <input type="hidden" name="display_order" value={editItem.display_order} />
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time Label</Label>
                <Input
                  id="edit-time"
                  name="time_label"
                  defaultValue={editItem.time_label ?? ""}
                  placeholder="8:30pm"
                />
              </div>
              <div className="flex gap-4">
                <select
                  name="is_start"
                  defaultValue={String(editItem.is_start)}
                  className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none"
                >
                  <option value="false">Normal</option>
                  <option value="true">Is Start</option>
                </select>
                <select
                  name="is_end"
                  defaultValue={String(editItem.is_end)}
                  className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none"
                >
                  <option value="false">Normal</option>
                  <option value="true">Is End</option>
                </select>
              </div>
              <SheetFooter className="px-0">
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Saving…" : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
