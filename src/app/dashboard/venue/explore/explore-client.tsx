"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Chip, EmptyState } from "@/components/dashboard/list-parts";
import { CollectionSheet } from "@/components/dashboard/collection-sheet";
import { toast } from "@/components/dashboard/toaster";
import { humanize, plural } from "@/lib/dashboard-lists";
import { deleteCollectionAction } from "./actions";
import { useRouter } from "next/navigation";
import type { ExploreCollection } from "@/types";

type CollectionWithCount = ExploreCollection & { itemCount: number; coverUrl: string | null };

interface ExploreClientProps {
  collections: CollectionWithCount[];
  venueId: string;
}

export function ExploreClient({ collections, venueId }: ExploreClientProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<ExploreCollection | null>(null);
  const [toDelete, setToDelete] = useState<CollectionWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(collection: ExploreCollection) {
    setSelected(collection);
    setSheetOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const fd = new FormData();
      fd.set("id", toDelete.id);
      fd.set("venueId", venueId);
      await deleteCollectionAction(fd);
      setToDelete(null);
      router.refresh();
    } catch {
      toast("Couldn't delete the collection. You may not have permission to delete.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Explore Collections</h1>
          <p className="text-muted-foreground">Curated lists of places for your guests.</p>
        </div>
        <Button onClick={openCreate} className="h-10">
          New collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No collections yet"
          description="A collection is a curated list of places, like Date Night or A Walk Through Ballard. Guests find them on the Explore page."
          actionLabel="New collection"
          onAction={openCreate}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Card
                className={`h-full gap-0 overflow-hidden py-0 ${collection.is_active ? "" : "opacity-80"}`}
              >
                <div className="bg-muted relative aspect-[16/9] shrink-0">
                  {collection.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={collection.coverUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`size-full object-cover ${collection.is_active ? "" : "grayscale"}`}
                    />
                  ) : (
                    <span className="text-muted-foreground flex size-full items-center justify-center">
                      <ImageIcon aria-hidden className="size-8" />
                    </span>
                  )}
                  {!collection.is_active && (
                    <span className="absolute top-3 left-3">
                      <Chip>Hidden</Chip>
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-semibold">{collection.title}</h2>
                      <Chip>{humanize(collection.layout)}</Chip>
                    </div>
                    <p className="text-muted-foreground truncate text-sm">
                      {[collection.area, plural(collection.itemCount, "place")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <Button asChild className="h-10 flex-1">
                      <Link href={`/dashboard/venue/explore/${collection.id}`}>Manage places</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="size-11 shrink-0 md:size-10"
                          aria-label={`More actions for ${collection.title}`}
                        >
                          <MoreHorizontal aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(collection)}>
                          <Pencil aria-hidden /> Edit details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-700 focus:text-red-800 dark:text-red-400 dark:focus:text-red-300"
                          onSelect={() => setToDelete(collection)}
                        >
                          <Trash2 aria-hidden /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <CollectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        collection={selected}
        venueId={venueId}
      />

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && !deleting && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {toDelete ? `“${toDelete.title}”` : "collection"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the collection and its{" "}
              {toDelete ? plural(toDelete.itemCount, "place link") : "place links"}. The places
              themselves stay in your list, but any card that opened this collection will no longer
              link to it. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep collection</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete collection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
