import { resolveSlug } from "@/lib/slug-resolver";
import { getNearbyPlaces } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

function PriceLevel({ level }: { level: number }) {
  return (
    <span style={{ fontSize: 12, color: "#8B8680" }}>
      {"$".repeat(level)}
      <span style={{ opacity: 0.3 }}>{"$".repeat(4 - level)}</span>
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
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "calc(env(safe-area-inset-top, 16px) + 12px) 20px 0" }}>
        <Link
          href={`/${slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "#1A7A6D",
            textDecoration: "none",
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 400,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: "#2D2A26",
            margin: "0 0 8px 0",
          }}>
            Dining & Drinks
          </h1>
          <div style={{ width: "60%", height: 2, background: "#1A7A6D", borderRadius: 1 }} />
        </div>

        <p style={{ fontSize: 14, color: "#8B8680", marginBottom: 24 }}>
          Restaurants, cafes, and bars nearby.
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px 40px" }}>
        {places.length === 0 ? (
          <p style={{ padding: "48px 0", textAlign: "center", fontSize: 14, color: "#8B8680" }}>
            No nearby places listed yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {places.map((place) => (
              <div
                key={place.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 5,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#2D2A26", margin: 0 }}>
                    {place.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {place.rating && (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: "#2D2A26" }}>
                        {place.rating}
                        <Star size={11} fill="#D4B483" color="#D4B483" />
                      </span>
                    )}
                    {place.price_level && <PriceLevel level={place.price_level} />}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <span style={{
                    padding: "2px 10px",
                    background: "#EDE8DE",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#8B8680",
                  }}>
                    {place.category}
                  </span>
                  {place.distance && (
                    <span style={{ fontSize: 12, color: "#8B8680" }}>{place.distance}</span>
                  )}
                </div>
                {place.description && (
                  <p style={{ fontSize: 13, color: "#8B8680", lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
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
