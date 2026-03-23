"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSlug } from "@/components/slug-context";
import { WelcomeEnvelope } from "@/components/guest/welcome-envelope";
import { createClient } from "@/lib/supabase/client";
import type { VenueEvent } from "@/types";
import { Phone, ArrowRight } from "lucide-react";

function formatVenueName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatEventTime(startTime: string, endTime: string | null): string {
  const start = new Date(startTime);
  const formatTime = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    const suffix = h >= 12 ? "pm" : "am";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return m === 0 ? `${hour}${suffix}` : `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
  };
  if (endTime) {
    const end = new Date(endTime);
    return `${formatTime(start)}–${formatTime(end)}`;
  }
  return formatTime(start);
}

export function VenueHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const resolved = useSlug();
  const venue = resolved.type === "venue" ? resolved.data : null;
  const venueName = venue?.name ?? formatVenueName(slug);

  // Extract location parts
  const locationParts = [venue?.city, venue?.state].filter(Boolean);
  const locationString =
    locationParts.length > 0 ? locationParts.join(" · ").toUpperCase() : "";

  // Welcome envelope state
  const [envelopeDismissed, setEnvelopeDismissed] = useState(false);
  const [envelopeVisible, setEnvelopeVisible] = useState(true);

  // Today's events
  const [todayEvents, setTodayEvents] = useState<VenueEvent[]>([]);

  useEffect(() => {
    if (!venue?.id) return;
    const supabase = createClient();
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    supabase
      .from("events")
      .select("*")
      .eq("venue_id", venue.id)
      .eq("is_active", true)
      .gte("start_time", startOfDay)
      .lt("start_time", endOfDay)
      .order("start_time", { ascending: true })
      .then(({ data }) => {
        if (data) setTodayEvents(data);
      });
  }, [venue?.id]);

  function handleEnvelopeEnter() {
    setEnvelopeDismissed(true);
    setTimeout(() => setEnvelopeVisible(false), 500);
  }

  const cityName = venue?.city ?? "the Area";

  const navItems = [
    {
      label: "Your Room & Stay",
      sublabel: "Amenities, services, and requests",
      href: `/${slug}/services`,
      image: "/images/room-placeholder.jpg",
    },
    {
      label: "Dining",
      sublabel: venue?.name ? `At ${venue.name}` : "Restaurants and cafes",
      href: `/${slug}/dining`,
      image: "/images/dining-placeholder.jpg",
    },
    {
      label: `Explore ${cityName}`,
      sublabel: "Let us show you around town",
      href: `/${slug}/dining`,
      image: "/images/explore-placeholder.jpg",
    },
  ];

  // Section divider component for consistency
  const SectionDivider = ({ title }: { title: string }) => (
    <div style={{ marginBottom: 16 }}>
      <h3
        style={{
          fontSize: 22,
          fontWeight: 400,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: "var(--foreground, #2D2A26)",
          margin: "0 0 8px 0",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          marginLeft: -20,
          width: "calc(60% + 20px)",
          height: 2,
          background: "var(--primary, #1A7A6D)",
        }}
      />
    </div>
  );

  return (
    <>
      {/* Welcome envelope overlay */}
      {envelopeVisible && (
        <div
          className="fixed inset-0 z-[100]"
          style={{
            opacity: envelopeDismissed ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <WelcomeEnvelope
            hotelName={venueName}
            tagline="Your stay begins here"
            onEnter={handleEnvelopeEnter}
          />
        </div>
      )}

      {/* Main scrollable page */}
      <div
        className="min-h-screen"
        style={{
          background: "var(--background, #F5F0E8)",
          fontFamily: "var(--font-sans, 'Inter', -apple-system, sans-serif)",
        }}
      >
        {/* Header section with shaped image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)",
            minHeight: 280,
          }}
        >
          {/* Image container — flush left, rounded right */}
          <div
            className={envelopeDismissed ? "animate-slide-in-left" : undefined}
            style={{
              width: "45%",
              minWidth: 160,
              maxWidth: 220,
              height: 280,
              borderRadius: "0 50% 50% 0",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {venue?.cover_image_url ? (
              <img
                src={venue.cover_image_url}
                alt={venueName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `
                    linear-gradient(135deg,
                      #8B6914 0%,
                      #5C4A1E 30%,
                      #3A3520 60%,
                      #2A2A1A 100%
                    )
                  `,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `
                      radial-gradient(ellipse at 60% 50%,
                        rgba(212, 160, 60, 0.3) 0%,
                        rgba(139, 80, 20, 0.2) 40%,
                        rgba(42, 36, 20, 0.6) 100%
                      )
                    `,
                  }}
                />
                <span
                  style={{
                    fontSize: 48,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: "rgba(212, 180, 131, 0.4)",
                    fontWeight: 300,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {venueName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Venue name and location */}
          <div
            className={envelopeDismissed ? "animate-fade-in" : undefined}
            style={{
              flex: 1,
              padding: "0 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 400,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: "var(--foreground, #2D2A26)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {venueName}
            </h1>
            <div
              style={{
                width: 32,
                height: 1,
                background: "#D0CBC3",
                margin: "12px 0 6px",
              }}
            />
            {locationString && (
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 2,
                  color: "var(--muted-foreground, #8B8680)",
                  marginTop: 8,
                  textTransform: "uppercase",
                }}
              >
                {locationString}
              </p>
            )}
          </div>
        </div>

        {/* Content area */}
        <div style={{ padding: "24px 20px 40px" }}>
          {/* Welcome card */}
          <div
            style={{
              background: "var(--card, #FFFFFF)",
              borderRadius: 5,
              padding: "28px 24px",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
              marginBottom: 32,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: "var(--foreground, #2D2A26)",
                marginBottom: 8,
              }}
            >
              Welcome.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted-foreground, #8B8680)",
                lineHeight: 1.6,
                marginBottom: venue?.phone ? 20 : 0,
              }}
            >
              We&apos;re glad you&apos;re here. Everything you need for your
              stay is right below.
            </p>
            {venue?.phone && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <a
                  href={`tel:${venue.phone.replace(/\D/g, "")}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    background: "transparent",
                    color: "var(--primary, #1A7A6D)",
                    border: "1px solid var(--primary, #1A7A6D)",
                    borderRadius: 5,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Phone size={15} />
                  Call the Front Desk
                </a>
              </div>
            )}
          </div>

          {/* Your Stay section */}
          <div style={{ marginBottom: 32 }}>
            <SectionDivider title="Your Stay" />

            <div
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    background: "var(--card, #FFFFFF)",
                    border: "none",
                    borderRadius: 5,
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                    transition: "transform 0.15s ease",
                    width: "100%",
                    overflow: "hidden",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.98)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onTouchStart={(e) =>
                    (e.currentTarget.style.transform = "scale(0.98)")
                  }
                  onTouchEnd={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {/* Thumbnail — flush to card edges */}
                  <div
                    style={{
                      width: 88,
                      alignSelf: "stretch",
                      overflow: "hidden",
                      flexShrink: 0,
                      background:
                        "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)",
                    }}
                  >
                    {/* Placeholder — replace with actual images */}
                  </div>

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0, padding: "16px 0" }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--foreground, #2D2A26)",
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--muted-foreground, #8B8680)",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.sublabel}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={18}
                    color="var(--primary, #1A7A6D)"
                    style={{ flexShrink: 0, marginRight: 12 }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tonight section */}
          {todayEvents.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionDivider title="Tonight" />

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      background: "var(--foreground, #2D2A26)",
                      borderRadius: 5,
                      padding: "20px 24px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: "var(--background, #F5F0E8)",
                        marginBottom: 4,
                      }}
                    >
                      {event.title} · {formatEventTime(event.start_time, event.end_time)}
                    </div>
                    {event.location && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(245, 240, 232, 0.6)",
                        }}
                      >
                        {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Concierge section */}
          <div style={{ marginBottom: 32 }}>
            <SectionDivider title="Concierge" />

            <p
              style={{
                fontSize: 14,
                color: "var(--muted-foreground, #8B8680)",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Ask us anything about your stay or the neighborhood.
            </p>

            <div
              style={{
                background: "var(--card, #FFFFFF)",
                borderRadius: 5,
                padding: 20,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
              }}
            >
              <button
                onClick={() => router.push(`/${slug}/concierge`)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--background, #F5F0E8)",
                  border: "1px solid var(--border, #DDD8CE)",
                  borderRadius: 5,
                  fontSize: 14,
                  color: "var(--muted-foreground, #8B8680)",
                  textAlign: "left",
                  cursor: "pointer",
                  marginBottom: 12,
                }}
              >
                What are you looking for?
              </button>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Dinner tonight", "Coffee nearby", "Late checkout", "Happy hour"].map(
                  (chip) => (
                    <button
                      key={chip}
                      onClick={() => router.push(`/${slug}/concierge`)}
                      style={{
                        padding: "8px 16px",
                        background: "transparent",
                        border: "1px solid var(--border, #DDD8CE)",
                        borderRadius: 20,
                        fontSize: 13,
                        color: "var(--foreground, #2D2A26)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--secondary, #EDE8DE)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {chip}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              paddingTop: 24,
              paddingBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--foreground, #2D2A26)",
                marginBottom: 4,
              }}
            >
              {venueName}
            </div>
            {venue?.address && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted-foreground, #8B8680)",
                  marginBottom: 4,
                }}
              >
                {venue.address}
              </div>
            )}
            {!venue?.address && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted-foreground, #8B8680)",
                  marginBottom: 4,
                }}
              >
                {[venue?.city, venue?.state].filter(Boolean).join(", ")}
              </div>
            )}
            {venue?.phone && (
              <a
                href={`tel:${venue.phone.replace(/\D/g, "")}`}
                style={{
                  fontSize: 13,
                  color: "var(--primary, #1A7A6D)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {venue.phone}
              </a>
            )}
          </div>

          {/* Bottom safe area */}
          <div style={{ height: "env(safe-area-inset-bottom, 20px)" }} />
        </div>
      </div>
    </>
  );
}
