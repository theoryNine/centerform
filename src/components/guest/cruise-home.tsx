"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSlug } from "@/components/slug-context";
import { Phone, ArrowRight, Anchor } from "lucide-react";
import { VenueFooter } from "@/components/guest/venue-footer";
import { WelcomeSplash } from "@/components/guest/welcome-splash";
import { PageHero } from "@/components/guest/page-hero";
import { NavCard, SectionDivider } from "@/components/guest/nav-card";
import { createClient } from "@/lib/supabase/client";
import type { CruiseDailyWelcome, CruiseLink } from "@/types";

function formatVenueName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CruiseHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const resolved = useSlug();
  const venue = resolved.type === "venue" ? resolved.data : null;
  const shipName = venue?.name ?? formatVenueName(slug);

  const locationString = venue?.ship_name?.toUpperCase() ?? "";
  // Welcome splash state — show only once per cruise venue
  const splashKey = `splash-dismissed:${slug}`;
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(splashKey)) {
      setSplashDismissed(true);
      setSplashVisible(false);
    }
  }, [splashKey]);

  function handleSplashEnter() {
    setSplashDismissed(true);
    localStorage.setItem(splashKey, "1");
    setTimeout(() => setSplashVisible(false), 500);
  }

  const [dailyWelcome, setDailyWelcome] = useState<CruiseDailyWelcome | null>(null);
  const [links, setLinks] = useState<CruiseLink[]>([]);

  useEffect(() => {
    if (!venue?.id) return;
    const supabase = createClient();
    supabase
      .from("cruise_daily_welcome")
      .select("*")
      .eq("venue_id", venue.id)
      .lte("effective_at", new Date().toISOString())
      .order("effective_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDailyWelcome(data as CruiseDailyWelcome);
      });
    supabase
      .from("cruise_links")
      .select("*")
      .eq("venue_id", venue.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data) setLinks(data as CruiseLink[]);
      });
  }, [venue?.id]);

  const navItems = [
    {
      label: "Ship Info",
      sublabel: "Your cabin, services & boarding",
      href: `/${slug}/ship-info`,
    },
    {
      label: "Food Onboard",
      sublabel: "Restaurants and dining venues",
      href: `/${slug}/food-onboard`,
    },
    {
      label: "Group Plan",
      sublabel: "Itinerary and schedule",
      href: `/${slug}/group-plan`,
    },
    {
      label: "The Crew",
      sublabel: "Meet your group",
      href: `/${slug}/the-crew`,
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
            name={shipName}
            tagline="Welcome aboard. We're glad you're here."
            coverImageUrl={venue?.cover_image_url ?? undefined}
            fallbackContent={
              <div
                className="flex size-full items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 40%, #2980B9 70%, #1A3A5C 100%)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 60% 50%, rgba(41,128,185,0.4) 0%, rgba(14,58,92,0.6) 100%)",
                  }}
                />
                <Anchor size={48} className="relative z-[1]" color="rgba(173,216,230,0.4)" />
              </div>
            }
            variant={venue?.splash_variant ?? "oversized"}
            onEnter={handleSplashEnter}
          />
        </div>
      )}

      <div className="min-h-screen bg-background font-sans">
        {/* Safe-area spacer: real DOM element so Safari doesn't skip it on initial load */}
        <div style={{ height: "env(safe-area-inset-top, 0px)" }} />
        {/* Header */}
      <PageHero
        imageUrl={venue?.cover_image_url}
        imageAlt={shipName}
        fallbackNode={
          <div
            className="flex size-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 40%, #2980B9 70%, #1A3A5C 100%)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 60% 50%, rgba(41,128,185,0.4) 0%, rgba(14,58,92,0.6) 100%)",
              }}
            />
            <Anchor size={48} className="relative z-[1]" color="rgba(173,216,230,0.4)" />
          </div>
        }
        title={shipName}
        subtitle={locationString || undefined}
        size="home"
        animated={splashDismissed}
      />
      {/* Content */}
      <div className="px-page pb-10 pt-6">
        {/* Welcome card */}
        <div className="card-shadow mb-section rounded-default bg-card p-card">
          <h2 className="mb-2 font-serif text-card-title-lg font-normal text-foreground">
            {dailyWelcome?.heading ?? venue?.welcome_heading ?? "Welcome aboard."}
          </h2>
          <p
            className={`text-body leading-[var(--cf-body-line-height)] text-muted-foreground ${venue?.phone ? "mb-5" : "mb-0"}`}
          >
            {dailyWelcome?.body ??
              venue?.welcome_body ??
              "We\u2019re glad you\u2019re here. Everything you need for your voyage is right below."}
          </p>
          {venue?.phone && (
            <div className="flex justify-end">
              <a
                href={`tel:${venue.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-default border border-primary bg-transparent px-5 py-2.5 text-cta-button font-semibold text-primary no-underline"
              >
                <Phone size={15} />
                {venue.phone_label ?? "Call the Bridge"}
              </a>
            </div>
          )}
        </div>

        {/* Your Voyage section */}
        <div className="mb-section">
          <SectionDivider title="Our Voyage" />

          <div className="flex flex-col gap-card-gap">
            {navItems.map((item) => (
              <NavCard key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Concierge section — temporarily hidden on cruise pages */}
        {/* <div className="mb-8">
          <SectionDivider title="Concierge" />
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Ask us anything about your voyage.
          </p>
          <ConciergePrompt slug={slug} />
        </div> */}

        {/* Links section */}
        {links.length > 0 && (
          <div className="mb-section">
            <SectionDivider title="Links" />
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-default bg-card px-4 py-3 text-cta-button font-medium text-primary no-underline card-shadow"
                >
                  {link.label}
                  <ArrowRight size={16} className="shrink-0 text-primary" />
                </a>
              ))}
            </div>
          </div>
        )}

        <VenueFooter venueName={shipName} address={venue?.ship_name} phone={venue?.phone} />
        <div className="h-safe-bottom" />
      </div>
    </div>
    </>
  );
}
