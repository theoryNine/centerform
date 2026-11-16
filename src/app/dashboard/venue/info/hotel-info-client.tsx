"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INFO_CATEGORIES, InfoSheet } from "@/components/dashboard/info-sheet";
import { groupInOrder, humanize } from "@/lib/dashboard-lists";
import type { InfoCategory, VenueInfo } from "@/types";

function formatKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface HotelInfoClientProps {
  info: VenueInfo[];
  venueId: string;
}

export function HotelInfoClient({ info, venueId }: HotelInfoClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<VenueInfo | null>(null);
  const [newCategory, setNewCategory] = useState<InfoCategory>("general");

  function openCreate(category: InfoCategory) {
    setSelected(null);
    setNewCategory(category);
    setSheetOpen(true);
  }

  function openEdit(item: VenueInfo) {
    setSelected(item);
    setSheetOpen(true);
  }

  // The known groups always show (so each has its own Add button); unknown ones follow.
  const byCategory = new Map(groupInOrder(info, (i) => i.category));
  const known = INFO_CATEGORIES.map((c) => ({ key: c.value as string, label: c.label }));
  const extra = [...byCategory.keys()]
    .filter((k) => !known.some((c) => c.key === k))
    .map((k) => ({ key: k, label: humanize(k) }));
  const groups = [...known, ...extra];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hotel Details</h1>
        <p className="text-muted-foreground">
          Key details shown to guests, like check-in times and policies.
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {groups.map(({ key, label }) => {
          const items = byCategory.get(key) ?? [];
          return (
            <Card key={key} className="gap-0 py-0">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-3">
                <CardTitle>
                  <h2 className="text-base">{label}</h2>
                </CardTitle>
                <Button
                  variant="outline"
                  className="h-10"
                  aria-label={`Add to ${label}`}
                  onClick={() => openCreate(key as InfoCategory)}
                >
                  Add
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {items.length === 0 ? (
                  <p className="text-muted-foreground px-4 py-6 text-sm">
                    Nothing here yet. Use Add to put something in {label}.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="hover:bg-muted/60 focus-visible:ring-primary grid min-h-12 w-full grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-4 px-4 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
                        >
                          <span className="truncate font-medium">{formatKey(item.key)}</span>
                          {item.value.trim() ? (
                            <span className="truncate">{item.value}</span>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <InfoSheet
        key={selected?.id ?? `new-${newCategory}`}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        info={selected}
        venueId={venueId}
        category={newCategory}
      />
    </div>
  );
}
