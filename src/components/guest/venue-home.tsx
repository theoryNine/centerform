"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSlug } from "@/components/slug-context";
import { WelcomeEnvelope } from "@/components/guest/welcome-envelope";
import {
  Compass,
  Calendar,
  MessageCircle,
  Bed,
  Phone,
  ChevronRight,
} from "lucide-react";

function formatVenueName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function VenueHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const resolved = useSlug();
  const venue = resolved.type === "venue" ? resolved.data : null;
  const venueName = venue?.name ?? formatVenueName(slug);

  // Extract location parts
  const locationParts = [venue?.city, venue?.state].filter(Boolean);
  const locationString = locationParts.length > 0
    ? locationParts.join(" · ").toUpperCase()
    : "";

  // Welcome envelope state
  const [envelopeDismissed, setEnvelopeDismissed] = useState(false);
  const [envelopeVisible, setEnvelopeVisible] = useState(true);

  function handleEnvelopeEnter() {
    setEnvelopeDismissed(true);
    setTimeout(() => setEnvelopeVisible(false), 500);
  }

  const navItems = [
    {
      label: "Your Room & Stay",
      sublabel: "Amenities, services, and requests",
      icon: Bed,
      href: `/${slug}/services`,
      image: "/images/room-placeholder.jpg",
    },
    {
      label: "Events & Activities",
      sublabel: "What's happening nearby",
      icon: Calendar,
      href: `/${slug}/events`,
      image: "/images/events-placeholder.jpg",
    },
    {
      label: "Dining & Drinks",
      sublabel: "Restaurants, cafes, and bars",
      icon: Compass,
      href: `/${slug}/dining`,
      image: "/images/dining-placeholder.jpg",
    },
    {
      label: "Concierge",
      sublabel: "Ask us anything",
      icon: MessageCircle,
      href: `/${slug}/concierge`,
      image: "/images/concierge-placeholder.jpg",
    },
  ];

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
          background: "#F5F0E8",
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        {/* Header section with shaped image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            paddingTop: "calc(env(safe-area-inset-top, 16px) + 24px)",
            minHeight: 280,
          }}
        >
          {/* Image container — flush left, rounded right */}
          <div
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
            {/* Placeholder gradient — replace with venue image */}
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
              {/* Warm ambient overlay to simulate lit doorway */}
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
          </div>

          {/* Venue name and location */}
          <div
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
                color: "#2D2A26",
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
                  fontWeight: 500,
                  letterSpacing: 2,
                  color: "#8B8680",
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
              background: "#FFFFFF",
              borderRadius: 5,
              padding: "28px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
              marginBottom: 32,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: "#2D2A26",
                marginBottom: 8,
              }}
            >
              Welcome.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#8B8680",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              We&apos;re glad you&apos;re here. Everything you need for your stay is right below.
            </p>
            {venue?.phone && (
              <a
                href={`tel:${venue.phone.replace(/\D/g, "")}`}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 0",
                  background: "#1A7A6D",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 5,
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <Phone
                  size={16}
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginRight: 8,
                    marginTop: -2,
                  }}
                />
                Call the Front Desk
              </a>
            )}
          </div>

          {/* Your Stay section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 400,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: "#2D2A26",
                  margin: "0 0 8px 0",
                }}
              >
                Your Stay
              </h3>
              <div
                style={{
                  width: "60%",
                  height: 2,
                  background: "#1A7A6D",
                  borderRadius: 1,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    background: "#FFFFFF",
                    border: "none",
                    borderRadius: 5,
                    padding: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                    transition: "transform 0.15s ease",
                    width: "100%",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 5,
                      overflow: "hidden",
                      flexShrink: 0,
                      background: `linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <item.icon size={24} color="#8B8680" />
                  </div>

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#2D2A26",
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#8B8680",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.sublabel}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={20} color="#8B8680" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom safe area */}
          <div style={{ height: "env(safe-area-inset-bottom, 20px)" }} />
        </div>
      </div>
    </>
  );
}
