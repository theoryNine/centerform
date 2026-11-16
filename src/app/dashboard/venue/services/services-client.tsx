"use client";

import { useMemo, useState } from "react";
import { BedDouble, Car, ConciergeBell, Info, Sparkles, Ticket, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Chip,
  EmptyState,
  ListGroup,
  ListRow,
  ListToolbar,
  NoResults,
  Thumb,
} from "@/components/dashboard/list-parts";
import { SERVICE_CATEGORIES, ServiceSheet } from "@/components/dashboard/service-sheet";
import { groupInOrder, humanize, matchesQuery, plural } from "@/lib/dashboard-lists";
import type { Service, ServiceCategory } from "@/types";

const CATEGORY_ICONS: Partial<
  Record<ServiceCategory, React.ComponentType<{ className?: string }>>
> = {
  room_service: BedDouble,
  spa: Sparkles,
  concierge: ConciergeBell,
  dining: Utensils,
  transportation: Car,
  activities: Ticket,
  other: Info,
};

const categoryLabel = (c: string) =>
  SERVICE_CATEGORIES.find((x) => x.value === c)?.label ?? humanize(c);

interface ServicesClientProps {
  services: Service[];
  venueId: string;
}

export function ServicesClient({ services, venueId }: ServicesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(service: Service) {
    setSelected(service);
    setSheetOpen(true);
  }

  const filters = useMemo(() => {
    const present = [...new Set(services.map((s) => s.category))];
    return [
      { key: "all", label: "All" },
      ...present.map((c) => ({ key: c, label: categoryLabel(c) })),
    ];
  }, [services]);

  const visible = services.filter(
    (s) =>
      (filter === "all" || s.category === filter) &&
      matchesQuery(search, s.name, s.description, categoryLabel(s.category)),
  );
  const groups = groupInOrder(visible, (s) => s.category);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage the services available to your guests.</p>
        </div>
        <Button onClick={openCreate} className="h-10">
          Add service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={ConciergeBell}
          title="No services yet"
          description="Services are what guests can ask for, like Wi-Fi, housekeeping or parking. They appear on the Services page."
          actionLabel="Add service"
          onAction={openCreate}
        />
      ) : (
        <>
          <ListToolbar
            search={search}
            onSearch={setSearch}
            searchLabel="Search services"
            filters={filters}
            filter={filter}
            onFilter={setFilter}
            filterLabel="Filter services by category"
            countText={plural(visible.length, "service")}
          />

          {visible.length === 0 ? (
            <NoResults
              query={search}
              onClear={() => {
                setSearch("");
                setFilter("all");
              }}
            />
          ) : (
            <div className="space-y-6">
              {groups.map(([category, items]) => (
                <ListGroup key={category} heading={categoryLabel(category)} count={items.length}>
                  {items.map((service) => (
                    <ListRow
                      key={service.id}
                      title={service.name}
                      meta={service.description?.replace(/\s+/g, " ") || undefined}
                      leading={<Thumb icon={CATEGORY_ICONS[service.category] ?? Info} />}
                      chips={!service.is_active ? <Chip>Draft</Chip> : undefined}
                      onOpen={() => openEdit(service)}
                    />
                  ))}
                </ListGroup>
              ))}
            </div>
          )}
        </>
      )}

      <ServiceSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        service={selected}
        venueId={venueId}
      />
    </div>
  );
}
