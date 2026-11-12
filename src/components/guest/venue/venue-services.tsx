"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import type { Service, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { AccordionItem } from "@/components/guest/primitives/accordion-item";
import { SectionHeader } from "@/components/guest/primitives/section-header";
import { useStickyNav } from "@/hooks/use-sticky-nav";
import { PageFrame } from "@/components/guest/primitives/page-frame";
import { PageTopBar, SlideDownNav } from "@/components/guest/primitives/page-top-bar";
import { VenueHeader } from "@/components/guest/primitives/sticky-header";
import { Multiline } from "@/components/guest/primitives/multiline";

// Section definitions — maps service categories to display sections
const SECTION_CONFIG = [
  {
    id: "room",
    number: "01",
    title: "Your Room",
    label: "Room",
    categories: ["room_service"] as string[],
  },
  {
    id: "services",
    number: "02",
    title: "Services",
    label: "Services",
    categories: ["spa", "concierge", "dining", "activities", "other"] as string[],
  },
  {
    id: "getting-here",
    number: "03",
    title: "Getting Here",
    label: "Getting Here",
    categories: ["transportation"] as string[],
  },
];

function parseWifiInfo(description: string): { network: string; password: string } | null {
  // Matches "Network: X — Password: Y" or "Network: X - Password: Y"
  const match = description.match(/Network:\s*(.+?)\s*[—–-]\s*Password:\s*(.+)/i);
  if (!match) return null;
  return { network: match[1].trim(), password: match[2].trim() };
}

function WifiContent({ network, password }: { network: string; password: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      const el = document.createElement("textarea");
      el.value = password;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  return (
    <div>
      {/* Network row */}
      <div className="mb-4">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
          Network
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">{network}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-border" />

      {/* Password row — full-width tap target */}
      <button
        onClick={handleCopyPassword}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-none p-0 text-left"
      >
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
            Password
          </div>
          <span className="text-base font-semibold text-foreground">{password}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary">
          {copied ? (
            <>
              Copied <Check size={14} />
            </>
          ) : (
            <>
              Copy <Copy size={14} />
            </>
          )}
        </span>
      </button>
    </div>
  );
}

function buildMapUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function SectionTab({
  section,
  isActive,
  onClick,
}: {
  section: (typeof SECTION_CONFIG)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`cursor-pointer rounded-chip border-none px-4 py-2 text-body-sm font-medium transition-all duration-200 ease-out ${
        isActive ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground"
      }`}
    >
      {section.label}
    </button>
  );
}

interface VenueServicesPageProps {
  venue: Venue;
  services: Service[];
  slug: string;
  pageDescription?: string | null;
  heroImageUrl?: string | null;
  checkoutTime?: string | null;
  frontDeskHours?: string | null;
}

export function VenueServicesPage({
  venue,
  services,
  slug,
  pageDescription,
  heroImageUrl,
  checkoutTime,
  frontDeskHours,
}: VenueServicesPageProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState("room");
  const { showStickyNav, headerRef } = useStickyNav();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Section tracking — separate from sticky nav visibility
  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTION_CONFIG.map((s) => ({
        id: s.id,
        el: sectionRefs.current[s.id],
      })).filter((s) => s.el);

      // The last section can be too short for its top to ever reach the threshold, so at the
      // bottom of the page it wins regardless.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && sections.length > 0) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].el!;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      const offset = 60; // sticky nav height
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Group services by section
  const sectionServices = SECTION_CONFIG.map((section) => ({
    ...section,
    services: services.filter((s) => section.categories.includes(s.category)),
  }));

  const venueName = venue.name;
  const fullAddress = [venue.address, venue.city, venue.state].filter(Boolean).join(", ");

  // Body of a service: the WiFi copy block, or its description.
  function serviceContent(service: Service) {
    const wifiInfo =
      service.name.toLowerCase().includes("wifi") && service.description
        ? parseWifiInfo(service.description)
        : null;
    if (wifiInfo) return <WifiContent network={wifiInfo.network} password={wifiInfo.password} />;
    return (
      service.description && (
        <p className="m-0 text-body-sm leading-[var(--cf-body-line-height)] text-muted-foreground">
          {service.description}
        </p>
      )
    );
  }

  // Shared by the phone subheader and the wide hero (hidden at the other widths).
  const addressLink = venue.address && (
    <a
      href={buildMapUrl(fullAddress)}
      target="_blank"
      rel="noopener noreferrer"
      className="block font-medium leading-snug text-primary no-underline"
    >
      {venue.address}
      {venue.city && (
        <>
          <br />
          {venue.city}
          {venue.state ? `, ${venue.state}` : ""}
        </>
      )}
    </a>
  );
  const hoursInfo = (
    <>
      <div>Front Desk: {frontDeskHours ?? "7am–10pm"}</div>
      <div className="font-semibold text-foreground">Check out by {checkoutTime ?? "11:00 AM"}</div>
    </>
  );

  return (
    <PageFrame width="wide">
      {/* Sticky nav — hidden until scroll past header. Laptop uses the side nav instead. */}
      <SlideDownNav
        show={showStickyNav}
        backHref={`/${slug}`}
        backLabel={venueName}
        title={venueName}
        width="wide"
        gutter="page"
        className="lg:hidden"
      >
        {/* Section tabs */}
        <div className="flex px-page pb-3">
          {SECTION_CONFIG.map((section) => (
            <SectionTab
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onClick={() => scrollToSection(section.id)}
            />
          ))}
        </div>
      </SlideDownNav>

      {/* Main header area */}
      <div ref={headerRef}>
        {/* Top bar with back arrow and venue name (phone; 600px+ uses the wide header below) */}
        <PageTopBar
          backHref={`/${slug}`}
          backLabel={venueName}
          title={venueName}
          titleHref={`/${slug}`}
          className="cmp:hidden"
        />

        {/* Wide header (600px+): replaces the phone top bar above */}
        <div className="hidden cmp:block">
          <VenueHeader venue={venue} slug={slug} scrolled={false} />
        </div>

        {/* Hero: image + title */}
        <PageHero
          imageUrl={heroImageUrl ?? venue.cover_image_url}
          imageAlt={venueName}
          fallbackNode={
            <div
              className="flex size-full items-center justify-center"
              style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A09680 100%)" }}
            >
              <span className="font-serif text-[40px] font-light text-white/50">
                {venueName.charAt(0)}
              </span>
            </div>
          }
          title={<>Your Room<br />&amp; Stay</>}
          className="pt-8"
          animated
          wide
          aside={
            <div className="space-y-2 text-body text-muted-foreground">
              {addressLink}
              <div className="leading-relaxed">{hoursInfo}</div>
            </div>
          }
        />

        {/* Subheader: address, hours, checkout (phone; from 600px these sit beside the title) */}
        <div className="flex justify-between gap-4 px-5 py-4 text-body text-muted-foreground cmp:hidden">
          <div>{addressLink}</div>
          <div className="text-right leading-relaxed">{hoursInfo}</div>
        </div>
      </div>

      {/* Accordion sections. Laptop: a sticky section nav in a 200px left column. */}
      <div className="px-page pb-10 lg:grid lg:grid-cols-[200px_1fr] lg:gap-x-12">
        <nav
          aria-label="Sections"
          className="hidden lg:sticky lg:top-6 lg:block lg:self-start lg:pt-12"
        >
          <ul className="m-0 list-none p-0">
            {SECTION_CONFIG.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex min-h-11 items-center border-l-2 py-2 pl-4 text-body-sm no-underline ${
                      isActive
                        ? "border-primary font-semibold text-foreground"
                        : "border-transparent text-muted-foreground"
                    }`}
                  >
                    {section.number} · {section.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          {pageDescription && (
            <p className="mb-6 pt-4 text-body leading-[var(--cf-body-line-height)] text-foreground">
              <Multiline text={pageDescription} />
            </p>
          )}
          {sectionServices.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="lg:scroll-mt-6"
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
            >
              <SectionHeader number={section.number} title={section.title} wide />

              {/* Accordion — one grouped card on phones, separate cards in two columns from 600px */}
              <div className="card-shadow rounded-default bg-card px-page cmp:grid cmp:grid-cols-2 cmp:items-start cmp:gap-4 cmp:bg-transparent cmp:px-0 cmp:[box-shadow:none] lg:hidden">
                {section.services.length === 0 ? (
                  <div className="py-6 text-center text-[13px] text-muted-foreground cmp:col-span-2">
                    No items yet.
                  </div>
                ) : (
                  section.services.map((service) => {
                    const itemId = `${section.id}-${service.id}`;
                    return (
                      <AccordionItem
                        key={service.id}
                        title={service.name}
                        isOpen={openItems.has(itemId)}
                        onToggle={() => toggleItem(itemId)}
                        wide
                      >
                        {serviceContent(service)}
                      </AccordionItem>
                    );
                  })
                )}
              </div>

              {/* Laptop: no accordion — every item is an open card, two across. Cards in a row stretch to
                  the same height (no items-start) so a short card doesn't leave a hole under it. */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
                {section.services.length === 0 ? (
                  <div className="py-6 text-[13px] text-muted-foreground lg:col-span-2">
                    No items yet.
                  </div>
                ) : (
                  section.services.map((service) => (
                    <div key={service.id} className="card-shadow rounded-default bg-card p-card">
                      <h3 className="m-0 mb-3 font-serif text-card-title-md font-medium text-foreground">
                        {service.name}
                      </h3>
                      {serviceContent(service)}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-page">
        <VenueFooter
          venueName={venueName}
          address={venue.address}
          phone={venue.phone}
          layout="responsive"
        />
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-bottom" />
    </PageFrame>
  );
}
