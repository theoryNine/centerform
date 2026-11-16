"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CollectionSheet } from "@/components/dashboard/collection-sheet";
import { Combobox } from "@/components/dashboard/combobox";
import { EditSheetFooter, SheetError, useEditSheet } from "@/components/dashboard/edit-sheet";
import { Chip, EmptyState, Thumb } from "@/components/dashboard/list-parts";
import { SegmentedControl } from "@/components/dashboard/segmented-control";
import { SheetSection, SheetShell } from "@/components/dashboard/sheet-shell";
import { SortableList } from "@/components/dashboard/sortable";
import { toast } from "@/components/dashboard/toaster";
import { humanize, plural } from "@/lib/dashboard-lists";
import {
  upsertCollectionItemAction,
  removeCollectionItemAction,
  reorderCollectionItemsAction,
} from "./actions";
import type { CollectionItemWithPlace, ExploreCollection, NearbyPlace } from "@/types";

type Position = "middle" | "start" | "end";
const positionOf = (item: { is_start: boolean; is_end: boolean }): Position =>
  item.is_start ? "start" : item.is_end ? "end" : "middle";

interface CollectionDetailClientProps {
  collection: ExploreCollection;
  items: CollectionItemWithPlace[];
  places: NearbyPlace[];
  venueId: string;
}

export function CollectionDetailClient({
  collection,
  items: serverItems,
  places,
  venueId,
}: CollectionDetailClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(serverItems);
  const [reordering, setReordering] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [itemSheet, setItemSheet] = useState<{
    open: boolean;
    item: CollectionItemWithPlace | null;
  }>({
    open: false,
    item: null,
  });
  const [toRemove, setToRemove] = useState<CollectionItemWithPlace | null>(null);
  const [removing, setRemoving] = useState(false);

  // Follow the server after a refresh.
  useEffect(() => setItems(serverItems), [serverItems]);

  const addedPlaceIds = new Set(items.map((i) => i.place_id));
  const availablePlaces = places.filter((p) => !addedPlaceIds.has(p.id));

  async function persistOrder(next: CollectionItemWithPlace[], message?: string) {
    const previous = items;
    setItems(next);
    setReordering(true);
    if (message) setAnnouncement(message);
    try {
      await reorderCollectionItemsAction(
        venueId,
        collection.id,
        next.map((i) => i.id),
      );
      router.refresh();
    } catch {
      setItems(previous);
      toast("Couldn't save the new order. It has been put back.", "error");
    } finally {
      setReordering(false);
    }
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= items.length || reordering) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    void persistOrder(next, `Moved ${moved.place.name} to position ${to + 1} of ${items.length}.`);
  }

  async function confirmRemove() {
    if (!toRemove) return;
    setRemoving(true);
    try {
      const fd = new FormData();
      fd.set("id", toRemove.id);
      fd.set("venueId", venueId);
      fd.set("collectionId", collection.id);
      await removeCollectionItemAction(fd);
      setToRemove(null);
      router.refresh();
    } catch {
      toast("Couldn't remove the place. Try again.", "error");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" asChild className="-ml-3 h-9">
            <Link href="/dashboard/venue/explore">← Collections</Link>
          </Button>
          <h1 className="text-2xl font-bold">{collection.title}</h1>
          <p className="text-muted-foreground">
            {[
              humanize(collection.layout) + " layout",
              plural(items.length, "place"),
              collection.area,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10" onClick={() => setEditSheetOpen(true)}>
            Edit details
          </Button>
          <Button className="h-10" onClick={() => setItemSheet({ open: true, item: null })}>
            Add place
          </Button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No places yet"
          description="Add the places guests should visit, then drag them into the order you want."
          actionLabel="Add place"
          onAction={() => setItemSheet({ open: true, item: null })}
        />
      ) : (
        <Card className="py-0">
          <CardContent className="p-0">
            <SortableList
              items={items}
              getId={(i) => i.id}
              getName={(i) => i.place.name}
              onReorder={(next) => void persistOrder(next)}
              disabled={reordering}
              className="relative"
              itemClassName="relative border-b last:border-b-0 before:absolute before:left-[31px] before:top-0 before:bottom-0 before:w-px before:bg-border first:before:top-1/2 last:before:bottom-1/2"
              renderItem={(item, index, handle) => (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className="bg-primary text-primary-foreground relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  >
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setItemSheet({ open: true, item })}
                    className="focus-visible:ring-primary flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2"
                  >
                    <Thumb src={item.place.image_url} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{item.place.name}</span>
                        {item.is_start && <Chip tone="accent">Start</Chip>}
                        {item.is_end && <Chip tone="accent">End</Chip>}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {[humanize(item.place.category), item.time_label]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center">
                    {handle}
                    <Button
                      variant="ghost"
                      className="size-11 md:size-9"
                      aria-label={`Move ${item.place.name} up`}
                      disabled={index === 0 || reordering}
                      onClick={() => move(index, index - 1)}
                    >
                      <ChevronUp aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      className="size-11 md:size-9"
                      aria-label={`Move ${item.place.name} down`}
                      disabled={index === items.length - 1 || reordering}
                      onClick={() => move(index, index + 1)}
                    >
                      <ChevronDown aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      className="size-11 text-red-700 hover:text-red-800 md:size-9 dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Remove ${item.place.name} from this collection`}
                      onClick={() => setToRemove(item)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      )}

      <CollectionSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        collection={collection}
        venueId={venueId}
      />

      <ItemSheet
        open={itemSheet.open}
        onOpenChange={(open) => setItemSheet((s) => ({ ...s, open }))}
        item={itemSheet.item}
        items={items}
        availablePlaces={availablePlaces}
        collection={collection}
        venueId={venueId}
      />

      <AlertDialog
        open={toRemove !== null}
        onOpenChange={(o) => !o && !removing && setToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {toRemove ? `“${toRemove.place.name}”` : "this place"} from the collection?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The place stays in your places list; it just won&apos;t appear in this collection any
              more.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={(e) => {
                e.preventDefault();
                void confirmRemove();
              }}
            >
              {removing ? "Removing…" : "Remove place"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Add place / edit stop ----------------------------------------------------------------

interface ItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The stop being edited, or null to add a place. */
  item: CollectionItemWithPlace | null;
  items: CollectionItemWithPlace[];
  availablePlaces: NearbyPlace[];
  collection: ExploreCollection;
  venueId: string;
}

function ItemSheet({
  open,
  onOpenChange,
  item,
  items,
  availablePlaces,
  collection,
  venueId,
}: ItemSheetProps) {
  const uid = useId();
  const isEdit = item !== null;
  const [placeId, setPlaceId] = useState("");
  const [position, setPosition] = useState<Position>("middle");

  useEffect(() => {
    if (!open) return;
    setPlaceId("");
    setPosition(item ? positionOf(item) : "middle");
  }, [open, item]);

  const sheet = useEditSheet({
    open,
    onOpenChange,
    validate: () => (!isEdit && !placeId ? "Choose a place to add." : null),
    save: async (fd) => {
      fd.set("venueId", venueId);
      fd.set("collectionId", collection.id);
      await upsertCollectionItemAction(fd);
    },
  });

  // Start and End belong to one stop each: say what will happen to the current one.
  const others = items.filter((i) => i.id !== item?.id);
  const currentStart = others.find((i) => i.is_start);
  const currentEnd = others.find((i) => i.is_end);
  const replaced =
    position === "start" ? currentStart : position === "end" ? currentEnd : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetShell
        title={isEdit ? `Edit ${item.place.name}` : "Add place"}
        description="Choose a place, its time label and where it sits in the collection."
        onSubmit={sheet.handleSubmit}
        footer={
          <EditSheetFooter
            isEdit={false}
            pending={sheet.pending}
            confirmDelete={false}
            onConfirmDelete={() => {}}
            onDelete={() => {}}
            onCancel={() => onOpenChange(false)}
            noun="place"
            addLabel={isEdit ? "Save changes" : "Add place"}
          />
        }
      >
        {isEdit && <input type="hidden" name="id" value={item.id} />}
        {isEdit && <input type="hidden" name="display_order" value={item.display_order} />}
        {isEdit && <input type="hidden" name="place_id" value={item.place_id} />}

        <SheetSection title="Place">
          {isEdit ? (
            <p className="text-sm font-medium">{item.place.name}</p>
          ) : availablePlaces.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
              Every place you have is already in this collection. Add more under Dining &amp; Drinks
              or Nearby Places first.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={`${uid}-place`}>Place (required)</Label>
              <Combobox
                id={`${uid}-place`}
                name="place_id"
                label="Place"
                options={availablePlaces.map((p) => ({
                  value: p.id,
                  label: p.name,
                  description: [
                    humanize(p.category),
                    p.area && p.area !== "on-site" ? p.area : null,
                  ]
                    .filter(Boolean)
                    .join(" · "),
                }))}
                value={placeId}
                onValueChange={setPlaceId}
                placeholder="Search your places"
                emptyText="No places match"
              />
            </div>
          )}
        </SheetSection>

        <SheetSection title="Position">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-time`}>Time label</Label>
            <Input
              id={`${uid}-time`}
              name="time_label"
              defaultValue={item?.time_label ?? ""}
              placeholder="8:30pm"
              aria-describedby={`${uid}-time-hint`}
            />
            <p id={`${uid}-time-hint`} className="text-muted-foreground text-xs">
              Shown on timeline collections.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm leading-none font-medium">Where does it sit?</p>
            <SegmentedControl
              name="position"
              label="Where does it sit in the collection?"
              options={[
                { value: "middle", label: "Middle" },
                { value: "start", label: "Start" },
                { value: "end", label: "End" },
              ]}
              value={position}
              onValueChange={(v) => setPosition(v as Position)}
            />
            <p className="text-muted-foreground text-xs" aria-live="polite">
              {replaced
                ? `${replaced.place.name} is the current ${position}. It will become a regular stop.`
                : "A collection has one Start and one End. Everything else is in the middle."}
            </p>
          </div>
        </SheetSection>

        <SheetError message={sheet.error} />
      </SheetShell>
    </Sheet>
  );
}
