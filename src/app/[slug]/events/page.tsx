import { resolveSlug } from "@/lib/slug-resolver";
import { getVenueEvents } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";

function formatEventDate(startTime: string, endTime: string | null) {
  const start = new Date(startTime);
  const date = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const events = await getVenueEvents(resolved.data.id);

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
            Events & Activities
          </h1>
          <div style={{ width: "60%", height: 2, background: "#1A7A6D", borderRadius: 1 }} />
        </div>

        <p style={{ fontSize: 14, color: "#8B8680", marginBottom: 24 }}>
          What&apos;s happening in and around the venue.
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px 40px" }}>
        {events.length === 0 ? (
          <p style={{ padding: "48px 0", textAlign: "center", fontSize: 14, color: "#8B8680" }}>
            No upcoming events at the moment.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 5,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#2D2A26", margin: 0 }}>
                    {event.title}
                  </p>
                  {event.is_featured && (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      background: "#1A7A6D",
                      color: "#FFFFFF",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      <Star size={10} />
                      Featured
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  {event.location && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8B8680" }}>
                      <MapPin size={12} />
                      {event.location}
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8B8680" }}>
                    <Calendar size={12} />
                    {formatEventDate(event.start_time, event.end_time)}
                  </span>
                </div>
                {event.description && (
                  <p style={{ fontSize: 13, color: "#8B8680", lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
                    {event.description}
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
