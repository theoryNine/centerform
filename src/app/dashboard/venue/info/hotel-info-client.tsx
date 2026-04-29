"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoSheet } from "@/components/dashboard/info-sheet";
import type { InfoCategory, VenueInfo } from "@/types";

const CATEGORY_LABELS: Record<InfoCategory, string> = {
  general: "General",
  policies: "Policies",
  hours: "Hours",
  payments: "Payments",
};

interface HotelInfoClientProps {
  info: VenueInfo[];
  venueId: string;
}

export function HotelInfoClient({ info, venueId }: HotelInfoClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<VenueInfo | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(item: VenueInfo) {
    setSelected(item);
    setSheetOpen(true);
  }

  const grouped = info.reduce<Record<string, VenueInfo[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hotel Info</h1>
          <p className="text-muted-foreground">Key details displayed to guests (check-in, policies, etc.).</p>
        </div>
        <Button onClick={openCreate}>Add Info</Button>
      </div>

      {info.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No info items yet. Add check-in times, policies, and more.
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {CATEGORY_LABELS[category as InfoCategory] ?? category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{item.key}</p>
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <InfoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        info={selected}
        venueId={venueId}
      />
    </div>
  );
}
