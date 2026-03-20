import { resolveSlug } from "@/lib/slug-resolver";
import { getEventScheduleItems } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Clock, MapPin, User } from "lucide-react";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "event") {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F0E8", padding: "48px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#8B8680" }}>This page is only available for events.</p>
      </div>
    );
  }

  const items = await getEventScheduleItems(resolved.data.id);

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const dayKey = new Date(item.start_time).toDateString();
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(item);
    return acc;
  }, {});

  const days = Object.entries(grouped).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Inter', -apple-system, sans-serif" }}>
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
            Schedule
          </h1>
          <div style={{ width: "60%", height: 2, background: "#1A7A6D", borderRadius: 1 }} />
        </div>

        <p style={{ fontSize: 14, color: "#8B8680", marginBottom: 24 }}>
          Full event schedule for {resolved.data.name}.
        </p>
      </div>

      <div style={{ padding: "0 20px 40px" }}>
        {days.length === 0 ? (
          <p style={{ padding: "48px 0", textAlign: "center", fontSize: 14, color: "#8B8680" }}>
            No schedule items yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {days.map(([dayKey, dayItems]) => (
              <div key={dayKey}>
                <h2 style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 2,
                  color: "#8B8680",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}>
                  {formatDayLabel(dayItems[0].start_time)}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#FFFFFF",
                        borderRadius: 5,
                        padding: "20px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#2D2A26", margin: 0 }}>
                          {item.title}
                        </p>
                        {item.is_featured && (
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
                        {item.location && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8B8680" }}>
                            <MapPin size={12} />
                            {item.location}
                          </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8B8680" }}>
                          <Clock size={12} />
                          {formatTime(item.start_time)}
                          {item.end_time && ` – ${formatTime(item.end_time)}`}
                        </span>
                      </div>
                      {item.speaker && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8B8680", marginTop: 6 }}>
                          <User size={12} />
                          {item.speaker}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
