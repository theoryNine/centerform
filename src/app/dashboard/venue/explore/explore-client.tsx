"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollectionSheet } from "@/components/dashboard/collection-sheet";
import type { ExploreCollection } from "@/types";

type CollectionWithCount = ExploreCollection & { itemCount: number };

interface ExploreClientProps {
  collections: CollectionWithCount[];
  venueId: string;
}

export function ExploreClient({ collections, venueId }: ExploreClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<ExploreCollection | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(collection: ExploreCollection) {
    setSelected(collection);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Explore Collections</h1>
          <p className="text-muted-foreground">Curated lists of places for your guests.</p>
        </div>
        <Button onClick={openCreate}>New Collection</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {collections.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No collections yet. Create your first to get started.
              </p>
            ) : (
              collections.map((collection) => (
                <div key={collection.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{collection.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {collection.layout} · {collection.itemCount}{" "}
                      {collection.itemCount === 1 ? "place" : "places"}
                      {collection.area ? ` · ${collection.area}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={collection.is_active ? "default" : "secondary"}>
                      {collection.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(collection)}
                    >
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/venue/explore/${collection.id}`}>
                        Manage Items
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <CollectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        collection={selected}
        venueId={venueId}
      />
    </div>
  );
}
