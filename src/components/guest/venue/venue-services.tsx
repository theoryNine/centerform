"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import type { Service, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/primitives/venue-footer";
import { PageHero } from "@/components/guest/primitives/page-hero";
import { CopyButton } from "@/components/guest/primitives/copy-button";
import { AccordionItem } from "@/components/guest/primitives/accordion-item";
import { SectionHeader } from "@/components/guest/primitives/section-header";
import { useStickyNav } from "@/hooks/use-sticky-nav";

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
}

export function VenueServicesPage({ venue, services, slug, pageDescription }: VenueServicesPageProps) {
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

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sticky nav — hidden until scroll past header */}
      <div
        className="fixed inset-x-0 top-0 z-50 bg-background transition-transform duration-300 ease-out"
        style={{
          transform: showStickyNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          {/* Sticky header row */}
          <div className="flex items-center px-5 py-3">
            <Link href={`/${slug}`} className="mr-3 flex items-center text-primary no-underline">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-serif text-base font-normal text-foreground">{venueName}</span>
          </div>

          {/* Section tabs */}
          <div className="flex px-5 pb-3">
            {SECTION_CONFIG.map((section) => (
              <SectionTab
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => scrollToSection(section.id)}
              />
            ))}
          </div>

          {/* Divider line — only visible with sticky nav */}
          <div className="h-px bg-border" />
        </div>
      </div>

      {/* Main header area */}
      <div ref={headerRef}>
        {/* Top bar with back arrow and venue name */}
        <div
          className="flex items-center px-5"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: 12 }}
        >
          <Link href={`/${slug}`} className="mr-3 flex items-center text-primary no-underline">
            <ArrowLeft size={20} />
          </Link>
          <Link
            href={`/${slug}`}
            className="font-serif text-base font-normal text-foreground no-underline"
          >
            {venueName}
          </Link>
        </div>

        {/* Hero: image + title */}
        <PageHero
          imageUrl={venue.cover_image_url}
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
        />

        {/* Subheader: address, hours, checkout */}
        <div className="flex justify-between gap-4 px-5 py-4 text-xs text-muted-foreground">
          <div>
            {venue.address && (
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
            )}
          </div>
          <div className="text-right leading-relaxed">
            <div>Front Desk: 7am–10pm</div>
            <div className="font-semibold text-foreground">Check out by 11:00 AM</div>
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <div className="px-page pb-10">
        {pageDescription && (
          <p className="mb-6 pt-4 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {pageDescription.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}
        {sectionServices.map((section) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
          >
            <SectionHeader number={section.number} title={section.title} />

            {/* Accordion card */}
            <div className="card-shadow rounded-default bg-card px-page">
              {section.services.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-muted-foreground">
                  No items yet.
                </div>
              ) : (
                section.services.map((service) => {
                  const itemId = `${section.id}-${service.id}`;
                  const wifiInfo =
                    service.name.toLowerCase().includes("wifi") && service.description
                      ? parseWifiInfo(service.description)
                      : null;

                  return (
                    <AccordionItem
                      key={service.id}
                      title={service.name}
                      isOpen={openItems.has(itemId)}
                      onToggle={() => toggleItem(itemId)}
                    >
                      {wifiInfo ? (
                        <WifiContent network={wifiInfo.network} password={wifiInfo.password} />
                      ) : (
                        service.description && (
                          <p className="m-0 text-body-sm leading-[var(--cf-body-line-height)] text-muted-foreground">
                            {service.description}
                          </p>
                        )
                      )}
                    </AccordionItem>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5">
        <VenueFooter venueName={venueName} address={venue.address} phone={venue.phone} />
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-bottom" />
    </div>
  );
}
