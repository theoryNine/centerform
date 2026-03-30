"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSlug } from "@/components/slug-context";
import { WelcomeEnvelope } from "@/components/guest/welcome-envelope";
import { createClient } from "@/lib/supabase/client";
import type { VenueEvent } from "@/types";
import { Phone, ArrowRight } from "lucide-react";
import { VenueFooter } from "@/components/guest/venue-footer";

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

  // Welcome envelope state — show only once per venue
  const envelopeKey = `envelope-dismissed:${slug}`;
  const [envelopeDismissed, setEnvelopeDismissed] = useState(false);
  const [envelopeVisible, setEnvelopeVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(envelopeKey)) {
      setEnvelopeDismissed(true);
      setEnvelopeVisible(false);
    }
  }, [envelopeKey]);

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
    localStorage.setItem(envelopeKey, "1");
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
      href: `/${slug}/explore`,
      image: "/images/explore-placeholder.jpg",
    },
  ];

  // Section divider component for consistency
  const SectionDivider = ({ title }: { title: string }) => (
    <div className="mb-4">
      <h3 className="mb-2 font-serif text-[22px] font-normal text-foreground">
        {title}
      </h3>
      <div className="-ml-5 h-0.5 w-[calc(60%+20px)] bg-primary" />
    </div>
  );

  return (
    <>
      {/* Welcome envelope overlay */}
      {envelopeVisible && (
        <div
          className="fixed inset-0 z-[100] transition-opacity duration-500 ease-out"
          style={{ opacity: envelopeDismissed ? 0 : 1 }}
        >
          <WelcomeEnvelope
            hotelName={venueName}
            tagline="Your stay begins here"
            onEnter={handleEnvelopeEnter}
          />
        </div>
      )}

      {/* Main scrollable page */}
      <div className="min-h-screen bg-background font-sans">
        {/* Header section with shaped image */}
        <div className="flex min-h-[280px] items-center pt-[calc(env(safe-area-inset-top,0px)+32px)]">
          {/* Image container — flush left, rounded right */}
          <div
            className={`relative h-[280px] w-[45%] min-w-[160px] max-w-[220px] shrink-0 overflow-hidden rounded-r-[50%] ${envelopeDismissed ? "animate-slide-in-left" : ""}`}
          >
            {venue?.cover_image_url ? (
              <img
                src={venue.cover_image_url}
                alt={venueName}
                className="size-full object-cover"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #8B6914 0%, #5C4A1E 30%, #3A3520 60%, #2A2A1A 100%)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 60% 50%, rgba(212,160,60,0.3) 0%, rgba(139,80,20,0.2) 40%, rgba(42,36,20,0.6) 100%)",
                  }}
                />
                <span className="relative z-[1] font-serif text-5xl font-light text-[rgba(212,180,131,0.4)]">
                  {venueName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Venue name and location */}
          <div
            className={`flex flex-1 flex-col items-center justify-center px-6 text-center ${envelopeDismissed ? "animate-fade-in" : ""}`}
          >
            <h1 className="m-0 font-serif text-[28px] font-normal leading-tight text-foreground">
              {venueName}
            </h1>
            <div className="my-3 mb-1.5 h-px w-8 bg-[#D0CBC3]" />
            {locationString && (
              <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[2px] text-muted-foreground">
                {locationString}
              </p>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="px-5 pb-10 pt-6">
          {/* Welcome card */}
          <div className="card-shadow mb-8 rounded-[5px] bg-card px-6 py-7">
            <h2 className="mb-2 font-serif text-[22px] font-normal text-foreground">
              Welcome.
            </h2>
            <p
              className={`text-sm leading-relaxed text-muted-foreground ${venue?.phone ? "mb-5" : "mb-0"}`}
            >
              We&apos;re glad you&apos;re here. Everything you need for your
              stay is right below.
            </p>
            {venue?.phone && (
              <div className="flex justify-end">
                <a
                  href={`tel:${venue.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-[5px] border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary no-underline"
                >
                  <Phone size={15} />
                  Call the Front Desk
                </a>
              </div>
            )}
          </div>

          {/* Your Stay section */}
          <div className="mb-8">
            <SectionDivider title="Your Stay" />

            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="card-shadow flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-[5px] border-none bg-card p-0 text-left transition-transform duration-150 ease-out active:scale-[0.98]"
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
                    className="w-[88px] shrink-0 self-stretch overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)",
                    }}
                  />

                  {/* Label */}
                  <div className="min-w-0 flex-1 py-4">
                    <div className="mb-0.5 text-[15px] font-semibold text-foreground">
                      {item.label}
                    </div>
                    <div className="text-[13px] leading-snug text-muted-foreground">
                      {item.sublabel}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={18}
                    color="var(--primary, #1A7A6D)"
                    className="mr-3 shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tonight section */}
          {todayEvents.length > 0 && (
            <div className="mb-8">
              <SectionDivider title="Tonight" />

              <div className="flex flex-col gap-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[5px] bg-foreground px-6 py-5"
                  >
                    <div className="mb-1 text-base font-medium text-background">
                      {event.title} · {formatEventTime(event.start_time, event.end_time)}
                    </div>
                    {event.location && (
                      <div className="text-[13px] text-background/60">
                        {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Concierge section */}
          <div className="mb-8">
            <SectionDivider title="Concierge" />

            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Ask us anything about your stay or the neighborhood.
            </p>

            <div className="card-shadow rounded-[5px] bg-card p-5">
              <button
                onClick={() => router.push(`/${slug}/concierge`)}
                className="mb-3 w-full cursor-pointer rounded-[5px] border border-border bg-background px-4 py-3 text-left text-sm text-muted-foreground"
              >
                What are you looking for?
              </button>

              <div className="flex flex-wrap gap-2">
                {["Dinner tonight", "Coffee nearby", "Late checkout", "Happy hour"].map(
                  (chip) => (
                    <button
                      key={chip}
                      onClick={() => router.push(`/${slug}/concierge`)}
                      className="cursor-pointer whitespace-nowrap rounded-full border border-border bg-transparent px-4 py-2 text-[13px] text-foreground transition-colors duration-150 ease-out hover:bg-secondary"
                    >
                      {chip}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <VenueFooter venueName={venueName} address={venue?.address} phone={venue?.phone} />

          {/* Bottom safe area */}
          <div className="h-safe-bottom" />
        </div>
      </div>
    </>
  );
}
