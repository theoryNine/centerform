"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSlug } from "@/components/slug-context";
import { WelcomeSplash } from "@/components/guest/primitives/welcome-splash";
import { createClient } from "@/lib/supabase/client";
import type { VenueEvent } from "@/types";
import { Phone } from "lucide-react";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { ConciergePrompt } from "@/components/guest/primitives/concierge-prompt";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { NavCard, SectionDivider } from "@/components/guest/primitives/nav-card";

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
  const resolved = useSlug();
  const venue = resolved.type === "venue" ? resolved.data : null;
  const venueName = venue?.name ?? formatVenueName(slug);

  // Extract location parts
  const locationParts = [venue?.city, venue?.state].filter(Boolean);
  const locationString =
    locationParts.length > 0 ? locationParts.join(" · ").toUpperCase() : "";

  // Welcome splash state — show only once per venue
  const splashKey = `splash-dismissed:${slug}`;
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [splashVisible, setSplashVisible] = useState(false);

  useLayoutEffect(() => {
    if (localStorage.getItem(splashKey)) {
      setSplashDismissed(true);
    } else {
      setSplashVisible(true);
    }
  }, [splashKey]);

  // Today's events
  const [todayEvents, setTodayEvents] = useState<VenueEvent[]>([]);
  const [navSublabels, setNavSublabels] = useState<Record<string, string>>({});
  const [navImages, setNavImages] = useState<Record<string, string>>({});
  const [navImagesReady, setNavImagesReady] = useState(false);
  const navImageSettledRef = useRef(0);
  const navImageTotalRef = useRef(0);

  function handleNavImageSettle() {
    navImageSettledRef.current += 1;
    if (navImageSettledRef.current >= navImageTotalRef.current) {
      setNavImagesReady(true);
    }
  }

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

    supabase
      .from("venue_nav_tiles")
      .select("nav_key, sublabel")
      .eq("venue_id", venue.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((row) => {
            if (row.sublabel) map[row.nav_key] = row.sublabel;
          });
          setNavSublabels(map);
        }
      });

    supabase
      .from("venue_page_descriptions")
      .select("page_slug, image_url")
      .eq("venue_id", venue.id)
      .in("page_slug", ["services", "dining", "explore"])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data?.forEach((row) => {
          if (row.image_url) map[row.page_slug] = row.image_url;
        });
        setNavImages(map);
        navImageTotalRef.current = Object.keys(map).length;
        if (navImageTotalRef.current === 0) setNavImagesReady(true);
      });
  }, [venue?.id]);

  function handleSplashEnter() {
    setSplashDismissed(true);
    localStorage.setItem(splashKey, "1");
    setTimeout(() => setSplashVisible(false), 500);
  }

  const cityName = venue?.city ?? "the Area";
  const navItems = [
    {
      label: "Your Room & Stay",
      sublabel: navSublabels["services"] ?? "Amenities, services, and requests",
      href: `/${slug}/services`,
      imageUrl: navImages["services"],
      onSettle: navImages["services"] ? handleNavImageSettle : undefined,
    },
    {
      label: "Dining",
      sublabel: navSublabels["dining"] ?? (venue?.name ? `At ${venue.name}` : "Restaurants and cafes"),
      href: `/${slug}/dining`,
      imageUrl: navImages["dining"],
      onSettle: navImages["dining"] ? handleNavImageSettle : undefined,
    },
    {
      label: `Explore ${cityName}`,
      sublabel: navSublabels["explore"] ?? "Let us show you around town",
      href: `/${slug}/explore`,
      imageUrl: navImages["explore"],
      onSettle: navImages["explore"] ? handleNavImageSettle : undefined,
    },
  ];

  return (
    <>
      {/* Welcome splash overlay */}
      {splashVisible && (
        <div
          className="fixed inset-0 z-[100] transition-opacity duration-500 ease-out"
          style={{ opacity: splashDismissed ? 0 : 1 }}
        >
          <WelcomeSplash
            name={venueName}
            tagline="Welcome, we're glad you're here"
            coverImageUrl={venue?.cover_image_url ?? undefined}
            fallbackContent={
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
            }
            variant={venue?.splash_variant ?? "text"}
            onEnter={handleSplashEnter}
          />
        </div>
      )}

      {!navImagesReady && <LoadingSpinner />}

      {/* Main scrollable page */}
      <div className="min-h-screen bg-background font-sans">
        {/* Safe-area spacer: real DOM element so Safari doesn't skip it on initial load */}
        <div style={{ height: "env(safe-area-inset-top, 0px)" }} />
        {/* Header section with shaped image */}
        <PageHero
          imageUrl={venue?.cover_image_url}
          imageAlt={venueName}
          fallbackNode={
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
          }
          title={venueName}
          subtitle={locationString || undefined}
          size="home"
          animated={splashDismissed}
        />
        {/* Content area */}
        <div className="px-page pb-10 pt-6">
          {/* Welcome card */}
          <div className="card-shadow mb-section rounded-default bg-card p-card">
            <h2 className="mb-2 font-serif text-card-title-lg font-medium text-foreground">
              {venue?.welcome_heading ?? "Welcome."}
            </h2>
            <p
              className={`text-body leading-[var(--cf-body-line-height)] text-muted-foreground ${venue?.phone ? "mb-5" : "mb-0"}`}
            >
              {venue?.welcome_body ??
                "We\u2019re glad you\u2019re here. Everything you need for your stay is right below."}
            </p>
            {venue?.phone && (
              <div className="flex justify-end">
                <a
                  href={`tel:${venue.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-default border border-primary bg-transparent px-5 py-2.5 text-cta-button font-semibold text-primary no-underline"
                >
                  <Phone size={15} />
                  {venue.phone_label ?? "Call the Front Desk"}
                </a>
              </div>
            )}
          </div>

          {/* Your Stay section */}
          <div className="mb-section">
            <SectionDivider title="Your Stay" />

            <div className="flex flex-col gap-card-gap">
              {navItems.map((item) => (
                <NavCard key={item.label} {...item} />
              ))}
            </div>
          </div>

          {/* Tonight section */}
          {todayEvents.length > 0 && (
            <div className="mb-section">
              <SectionDivider title="Tonight" />

              <div className="flex flex-col gap-card-gap">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-default bg-foreground px-6 py-5"
                  >
                    <div className="mb-1 text-base font-medium text-background">
                      {event.title} · {formatEventTime(event.start_time, event.end_time)}
                    </div>
                    {event.location && (
                      <div className="text-body-sm text-background/60">
                        {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Concierge section */}
          <div className="mb-section">
            <SectionDivider title="Concierge" />

            <p className="mb-4 text-body leading-[var(--cf-body-line-height)] text-muted-foreground">
              Ask us anything about your stay or the neighborhood.
            </p>

            <ConciergePrompt slug={slug} />
          </div>

          <VenueFooter venueName={venueName} address={venue?.address} phone={venue?.phone} />

          {/* Bottom safe area */}
          <div className="h-safe-bottom" />
        </div>
      </div>
    </>
  );
}
