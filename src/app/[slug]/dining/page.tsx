import { resolveSlug } from "@/lib/slug-resolver";
import { getNearbyPlaces } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {"$".repeat(level)}
      <span className="opacity-30">{"$".repeat(4 - level)}</span>
    </span>
  );
}

export default async function DiningPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const places = await getNearbyPlaces(resolved.data.id);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <div className="pt-safe px-5">
        <Link
          href={`/${slug}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="mb-5">
          <h1 className="mb-2 font-serif text-[22px] font-normal text-foreground">
            Dining & Drinks
          </h1>
          <div className="h-0.5 w-3/5 rounded-sm bg-primary" />
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Restaurants, cafes, and bars nearby.
        </p>
      </div>

      {/* Content */}
      <div className="px-5 pb-10">
        {places.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No nearby places listed yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="card-shadow rounded-[5px] bg-card p-5"
              >
                <div className="flex items-start justify-between">
                  <p className="m-0 text-[15px] font-semibold text-foreground">
                    {place.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {place.rating && (
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-foreground">
                        {place.rating}
                        <Star size={11} fill="#D4B483" color="#D4B483" />
                      </span>
                    )}
                    {place.price_level && <PriceLevel level={place.price_level} />}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {place.category}
                  </span>
                  {place.distance && (
                    <span className="text-xs text-muted-foreground">{place.distance}</span>
                  )}
                </div>
                {place.description && (
                  <p className="mb-0 mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                    {place.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
