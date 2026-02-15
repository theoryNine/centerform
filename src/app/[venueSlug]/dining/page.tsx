import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const placeholderDining = [
  {
    name: "La Terrazza",
    category: "restaurant",
    distance: "0.1 mi",
    rating: 4.5,
    priceLevel: 3,
    description: "Italian fine dining with a seasonal menu and garden terrace.",
  },
  {
    name: "The Local",
    category: "restaurant",
    distance: "0.2 mi",
    rating: 4.3,
    priceLevel: 2,
    description: "Farm-to-table American cuisine in a relaxed atmosphere.",
  },
  {
    name: "Bloom Coffee",
    category: "cafe",
    distance: "0.1 mi",
    rating: 4.7,
    priceLevel: 1,
    description: "Specialty coffee and pastries. Great for a morning pick-me-up.",
  },
  {
    name: "The Rooftop Bar",
    category: "bar",
    distance: "In-house",
    rating: 4.4,
    priceLevel: 3,
    description: "Craft cocktails with panoramic city views. Open nightly.",
  },
  {
    name: "Sakura Sushi",
    category: "restaurant",
    distance: "0.3 mi",
    rating: 4.6,
    priceLevel: 2,
    description: "Authentic Japanese cuisine with an extensive sake selection.",
  },
];

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {"$".repeat(level)}
      <span className="opacity-30">{"$".repeat(4 - level)}</span>
    </span>
  );
}

export default function DiningPage() {
  return (
    <div className="py-6">
      <h1 className="text-xl font-bold">Dining</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Restaurants, cafes, and bars nearby.
      </p>

      <div className="mt-4 space-y-3">
        {placeholderDining.map((place) => (
          <Card key={place.name}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium">{place.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{place.rating} ★</span>
                  <PriceLevel level={place.priceLevel} />
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {place.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{place.distance}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{place.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
