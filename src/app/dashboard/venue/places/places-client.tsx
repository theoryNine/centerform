"use client";

import { useMemo, useState } from "react";
import {
  Coffee,
  Landmark,
  MapPin,
  Music,
  ShoppingBag,
  TreePine,
  Utensils,
  Wine,
} from "lucide-react";
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
import { PLACE_CATEGORIES, PlaceSheet } from "@/components/dashboard/place-sheet";
import { groupInOrder, humanize, matchesQuery, plural } from "@/lib/dashboard-lists";
import type { ExploreCollection, NearbyPlace, PlaceCategory } from "@/types";

const DINING_CATEGORIES: PlaceCategory[] = ["restaurant", "bar", "cafe"];
const ON_SITE = "on-site";

const CATEGORY_ICONS: Record<PlaceCategory, React.ComponentType<{ className?: string }>> = {
  restaurant: Utensils,
  bar: Wine,
  cafe: Coffee,
  attraction: Landmark,
  shopping: ShoppingBag,
  entertainment: Music,
  outdoors: TreePine,
  other: MapPin,
};

const categoryLabel = (c: string) =>
  PLACE_CATEGORIES.find((x) => x.value === c)?.label ?? humanize(c);

function placeMeta(place: NearbyPlace, isDining: boolean): string {
  const where = isDining && place.area && place.area !== ON_SITE ? place.area : null;
  return [categoryLabel(place.category), where, place.tagline].filter(Boolean).join(" · ");
}

interface PlacesClientProps {
  places: NearbyPlace[];
  collections: ExploreCollection[];
  venueId: string;
  type: "dining" | "places";
}

export function PlacesClient({ places, collections, venueId, type }: PlacesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<NearbyPlace | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const isDining = type === "dining";
  const title = isDining ? "Dining & Drinks" : "Nearby Places";
  const noun = isDining ? "spot" : "place";

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(place: NearbyPlace) {
    setSelected(place);
    setSheetOpen(true);
  }

  // Only this page's kind of place (dining spots, or everything else).
  const pagePlaces = useMemo(
    () =>
      places.filter((p) =>
        isDining ? DINING_CATEGORIES.includes(p.category) : !DINING_CATEGORIES.includes(p.category),
      ),
    [places, isDining],
  );

  // Dining filters by where the spot is; Nearby filters by category.
  const filters = useMemo(() => {
    const all = { key: "all", label: "All" };
    if (isDining) {
      const areas = [
        ...new Set(pagePlaces.map((p) => p.area).filter((a): a is string => !!a && a !== ON_SITE)),
      ];
      return [
        all,
        ...(pagePlaces.some((p) => p.area === ON_SITE)
          ? [{ key: ON_SITE, label: "At the hotel" }]
          : []),
        ...areas.map((a) => ({ key: a, label: a })),
      ];
    }
    const categories = [...new Set(pagePlaces.map((p) => p.category))];
    return [all, ...categories.map((c) => ({ key: c, label: categoryLabel(c) }))];
  }, [pagePlaces, isDining]);

  const visible = pagePlaces.filter(
    (p) =>
      (filter === "all" || (isDining ? p.area === filter : p.category === filter)) &&
      matchesQuery(
        search,
        p.name,
        p.tagline,
        categoryLabel(p.category),
        p.area === ON_SITE ? "at the hotel" : p.area,
      ),
  );

  // Dining mirrors the guest page: At the hotel, Nearby recommendations, then collection cards.
  // Nearby Places groups by area, in the order the guest Explore page uses.
  const groups: [string, NearbyPlace[]][] = isDining
    ? ([
        ["At the hotel", visible.filter((p) => p.area === ON_SITE)],
        ["Nearby recommendations", visible.filter((p) => p.area !== ON_SITE && !p.collection_id)],
        ["Collection cards", visible.filter((p) => p.area !== ON_SITE && !!p.collection_id)],
      ].filter(([, list]) => list.length > 0) as [string, NearbyPlace[]][])
    : groupInOrder(visible, (p) => p.area ?? "Other");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Recommendations and explore cards for guests.</p>
        </div>
        <Button onClick={openCreate} className="h-10">
          Add place
        </Button>
      </div>

      {pagePlaces.length === 0 ? (
        <EmptyState
          icon={isDining ? Utensils : MapPin}
          title={isDining ? "No dining or drink spots yet" : "No places yet"}
          description={
            isDining
              ? "Add your restaurants and bars, and the best spots nearby. They appear on the Dining page."
              : "Add your first recommendation: a restaurant, park or shop guests will like. Places appear on the Explore page."
          }
          actionLabel="Add place"
          onAction={openCreate}
        />
      ) : (
        <>
          <ListToolbar
            search={search}
            onSearch={setSearch}
            searchLabel={`Search ${isDining ? "dining spots" : "places"}`}
            filters={filters}
            filter={filter}
            onFilter={setFilter}
            filterLabel={isDining ? "Filter by location" : "Filter by category"}
            countText={plural(visible.length, noun)}
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
              {groups.map(([heading, items]) => (
                <ListGroup key={heading} heading={heading} count={items.length}>
                  {items.map((place) => (
                    <ListRow
                      key={place.id}
                      title={place.name}
                      meta={placeMeta(place, isDining)}
                      leading={
                        <Thumb src={place.image_url} icon={CATEGORY_ICONS[place.category]} />
                      }
                      chips={
                        <>
                          {place.is_featured && <Chip tone="featured">Featured</Chip>}
                          {place.collection_id && <Chip>Collection</Chip>}
                        </>
                      }
                      onOpen={() => openEdit(place)}
                    />
                  ))}
                </ListGroup>
              ))}
            </div>
          )}
        </>
      )}

      <PlaceSheet
        key={selected?.id ?? "new"}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        place={selected}
        venueId={venueId}
        collections={collections}
        defaultCategory={isDining ? "restaurant" : "attraction"}
      />
    </div>
  );
}
