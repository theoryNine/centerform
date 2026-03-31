"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSlug } from "@/components/slug-context";
import { Phone, ArrowRight, Anchor } from "lucide-react";
import { VenueFooter } from "@/components/guest/venue-footer";
import { createClient } from "@/lib/supabase/client";
import type { CruiseLink } from "@/types";

function formatVenueName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CruiseHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const resolved = useSlug();
  const venue = resolved.type === "venue" ? resolved.data : null;
  const shipName = venue?.name ?? formatVenueName(slug);

  const locationParts = [venue?.city, venue?.state].filter(Boolean);
  const locationString =
    locationParts.length > 0 ? locationParts.join(" · ").toUpperCase() : "";

  const [links, setLinks] = useState<CruiseLink[]>([]);

  useEffect(() => {
    if (!venue?.id) return;
    const supabase = createClient();
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

  const SectionDivider = ({ title }: { title: string }) => (
    <div className="mb-4">
      <h3 className="mb-2 font-serif text-[22px] font-normal text-foreground">{title}</h3>
      <div className="-ml-5 h-0.5 w-[calc(60%+20px)] bg-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <div className="flex min-h-[280px] items-center pt-[calc(env(safe-area-inset-top,0px)+32px)]">
        {/* Image — flush left, rounded right */}
        <div className="relative h-[280px] w-[45%] min-w-[160px] max-w-[220px] shrink-0 overflow-hidden rounded-r-[50%]">
          {venue?.cover_image_url ? (
            <img
              src={venue.cover_image_url}
              alt={shipName}
              className="size-full object-cover"
            />
          ) : (
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
              <Anchor
                size={48}
                className="relative z-[1]"
                color="rgba(173,216,230,0.4)"
              />
            </div>
          )}
        </div>

        {/* Ship name and location */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h1 className="m-0 font-serif text-[28px] font-normal leading-tight text-foreground">
            {shipName}
          </h1>
          <div className="my-3 mb-1.5 h-px w-8 bg-[#D0CBC3]" />
          {locationString && (
            <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[2px] text-muted-foreground">
              {locationString}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-10 pt-6">
        {/* Welcome card */}
        <div className="card-shadow mb-8 rounded-[5px] bg-card px-6 py-7">
          <h2 className="mb-2 font-serif text-[22px] font-normal text-foreground">
            Welcome aboard.
          </h2>
          <p
            className={`text-sm leading-relaxed text-muted-foreground ${venue?.phone ? "mb-5" : "mb-0"}`}
          >
            We&apos;re glad you&apos;re here. Everything you need for your voyage is right below.
          </p>
          {venue?.phone && (
            <div className="flex justify-end">
              <a
                href={`tel:${venue.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-[5px] border border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary no-underline"
              >
                <Phone size={15} />
                Call the Bridge
              </a>
            </div>
          )}
        </div>

        {/* Your Voyage section */}
        <div className="mb-8">
          <SectionDivider title="Your Voyage" />

          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="card-shadow flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-[5px] border-none bg-card p-0 text-left transition-transform duration-150 ease-out active:scale-[0.98]"
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div
                  className="w-[88px] shrink-0 self-stretch overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)",
                  }}
                />
                <div className="min-w-0 flex-1 py-4">
                  <div className="mb-0.5 text-[15px] font-semibold text-foreground">
                    {item.label}
                  </div>
                  <div className="text-[13px] leading-snug text-muted-foreground">
                    {item.sublabel}
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  color="var(--primary, #1A7A6D)"
                  className="mr-3 shrink-0"
                />
              </button>
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
          <div className="mb-8">
            <SectionDivider title="Links" />
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-[5px] bg-card px-4 py-3 text-[15px] font-medium text-primary no-underline card-shadow"
                >
                  {link.label}
                  <ArrowRight size={16} className="shrink-0 text-primary" />
                </a>
              ))}
            </div>
          </div>
        )}

        <VenueFooter venueName={shipName} address={venue?.address} phone={venue?.phone} />
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
