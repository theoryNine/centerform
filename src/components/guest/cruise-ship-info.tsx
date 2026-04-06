"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Service, ServiceDetails, ServiceDetailsBlock, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";
import { PageHero } from "@/components/guest/page-hero";
import { CopyButton } from "@/components/guest/copy-button";
import { AccordionItem } from "@/components/guest/accordion-item";
import { SectionHeader } from "@/components/guest/section-header";
import { useStickyNav } from "@/hooks/use-sticky-nav";

// Cruise-specific section config
const SECTION_CONFIG = [
  {
    id: "welcome",
    number: "01",
    title: "Welcome Aboard",
    label: "Welcome",
    categories: ["welcome_aboard"] as string[],
  },
  {
    id: "amenities",
    number: "02",
    title: "Amenities",
    label: "Amenities",
    categories: ["ship_amenities"] as string[],
  },
  {
    id: "entertainment",
    number: "03",
    title: "Entertainment",
    label: "Entertainment",
    categories: ["ship_entertainment"] as string[],
  },
];

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function ServiceDetailsBlock({ block }: { block: ServiceDetailsBlock }) {
  if (block.type === "text") {
    const lines = block.content.split("\n");
    return (
      <p className="m-0 text-body-sm leading-[var(--cf-body-line-height)] text-muted-foreground">
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            <InlineBold text={line} />
          </span>
        ))}
      </p>
    );
  }

  if (block.type === "bullets") {
    return (
      <ul className="m-0 flex flex-col gap-1 list-none p-0">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-body-sm leading-[var(--cf-body-line-height)] text-muted-foreground"
          >
            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
            <InlineBold text={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "phone") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-muted-foreground">
          <InlineBold text={block.label} />
        </span>
        <a
          href={`tel:${block.value.replace(/\D/g, "")}`}
          className="text-body-sm font-semibold text-primary no-underline"
        >
          {block.value}
        </a>
      </div>
    );
  }

  if (block.type === "kv") {
    return (
      <div className="flex flex-col gap-2">
        {block.rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="text-body-sm text-muted-foreground">
              <InlineBold text={row.label} />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-medium text-foreground">
                <InlineBold text={row.value} />
              </span>
              {row.copy && <CopyButton text={row.value} />}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function ServiceDetailsRenderer({ details }: { details: ServiceDetails }) {
  const blocks = Array.isArray(details) ? details : [details];
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => (
        <ServiceDetailsBlock key={i} block={block} />
      ))}
    </div>
  );
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

interface CruiseShipInfoPageProps {
  venue: Venue;
  services: Service[];
  slug: string;
  pageDescription?: string | null;
  heroImageUrl?: string | null;
}

export function CruiseShipInfoPage({
  venue,
  services,
  slug,
  pageDescription,
  heroImageUrl,
}: CruiseShipInfoPageProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState("welcome");
  const { showStickyNav, headerRef } = useStickyNav();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Section tracking — update active tab as sections scroll into view
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
      const offset = 60;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const sectionServices = SECTION_CONFIG.map((section) => ({
    ...section,
    services: services.filter((s) => section.categories.includes(s.category)),
  }));

  const shipName = venue.name;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sticky nav */}
      <div
        className="fixed inset-x-0 top-0 z-50 bg-background transition-transform duration-300 ease-out"
        style={{ transform: showStickyNav ? "translateY(0)" : "translateY(-100%)" }}
      >
        <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="relative flex items-center px-5 py-3">
            <Link href={`/${slug}`} className="shrink-0 text-primary no-underline">
              <ArrowLeft size={20} />
            </Link>
            <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
              <span className="font-serif text-[20px] font-normal text-foreground">{shipName}</span>
            </div>
            <div className="w-5 shrink-0" />
          </div>
          <div className="-mx-1 flex overflow-x-auto px-5 pb-3 scrollbar-none">
            {SECTION_CONFIG.map((section) => (
              <SectionTab
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => scrollToSection(section.id)}
              />
            ))}
          </div>
          <div className="h-px bg-border" />
        </div>
      </div>

      {/* Main header */}
      <div ref={headerRef}>
        <div
          className="relative flex items-center px-5"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
            paddingBottom: 12,
          }}
        >
          <Link href={`/${slug}`} className="shrink-0 text-primary no-underline">
            <ArrowLeft size={20} />
          </Link>
          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
            <Link
              href={`/${slug}`}
              className="pointer-events-auto font-serif text-[20px] font-normal text-foreground no-underline"
            >
              {shipName}
            </Link>
          </div>
          <div className="w-5 shrink-0" />
        </div>

        {/* Hero */}
        <PageHero
          imageUrl={heroImageUrl ?? venue.cover_image_url}
          imageAlt={shipName}
          fallbackNode={
            <div
              className="flex size-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #0E3A5C 0%, #1A5C8A 40%, #2980B9 70%, #1A3A5C 100%)",
              }}
            >
              <span className="font-serif text-[40px] font-light text-white/50">
                {shipName.charAt(0)}
              </span>
            </div>
          }
          title="Ship Info"
          className="pt-8"
        />
      </div>

      {/* Accordion sections */}
      <div className="px-page pb-10">
        {pageDescription && (
          <p className="mb-6 pt-4 text-body leading-[var(--cf-body-line-height)] text-foreground">
            {pageDescription}
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

            <div className="card-shadow rounded-default bg-card px-page">
              {section.services.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-muted-foreground">
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
                    >
                      {service.details ? (
                        <ServiceDetailsRenderer details={service.details} />
                      ) : service.description ? (
                        <p className="m-0 text-body-sm leading-[var(--cf-body-line-height)] text-muted-foreground">
                          {service.description}
                        </p>
                      ) : null}
                    </AccordionItem>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5">
        <VenueFooter venueName={shipName} address={venue.ship_name} phone={venue.phone} />
      </div>

      <div className="h-safe-bottom" />
    </div>
  );
}
