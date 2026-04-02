"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Copy, Check } from "lucide-react";
import type { Service, Venue } from "@/types";
import { VenueFooter } from "@/components/guest/venue-footer";

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

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1 border-none bg-none p-0 text-[13px] font-semibold text-primary"
    >
      {label && <span>{label}</span>}
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

// Re-export CopyButton for potential use
export { CopyButton };

function AccordionItem({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div className="-mx-5 border-b border-border px-5">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-none py-4 text-left"
      >
        <span className="text-cta-button font-medium text-foreground">{title}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-[250ms] ease-out ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
        className="overflow-hidden transition-[height] duration-[250ms] ease-out"
        style={{ height: isOpen ? contentHeight : 0 }}
      >
        <div ref={contentRef} className="pb-4">
          {children}
        </div>
      </div>
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
      className={`cursor-pointer rounded-chip border-none px-4 py-2 text-description font-medium transition-all duration-200 ease-out ${
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
}

export function CruiseShipInfoPage({ venue, services, slug }: CruiseShipInfoPageProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [activeSection, setActiveSection] = useState("welcome");
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setShowStickyNav(rect.bottom <= 0);
      }

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
        <div className="flex min-h-[180px] items-center">
          <div className="relative h-[180px] w-2/5 min-w-[140px] max-w-[180px] shrink-0 overflow-hidden rounded-r-[50%]">
            {venue.cover_image_url ? (
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
                <span className="font-serif text-[40px] font-light text-white/50">
                  {shipName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <h1 className="m-0 font-serif text-page-title font-normal leading-tight text-foreground">
              Ship Info
            </h1>
          </div>
        </div>

        {/* Section tabs (inline) */}
        <div className="-mx-1 flex overflow-x-auto px-5 pt-5 pb-1 scrollbar-none">
          {SECTION_CONFIG.map((section) => (
            <SectionTab
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onClick={() => scrollToSection(section.id)}
            />
          ))}
        </div>

        {/* Subheader */}
        {venue.address && (
          <div className="px-5 py-4 text-xs text-muted-foreground">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [venue.address, venue.city, venue.state].filter(Boolean).join(", "),
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium leading-snug text-primary no-underline"
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
          </div>
        )}
      </div>

      {/* Accordion sections */}
      <div className="px-page pb-10">
        {sectionServices.map((section) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
          >
            <div className="pb-2 pt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-section-number font-medium text-primary">{section.number}</span>
                <span className="text-section-number text-muted-foreground">·</span>
                <h2 className="m-0 font-serif text-section-heading font-normal text-foreground">
                  {section.title}
                </h2>
              </div>
              <div className="-ml-page mt-2 h-px w-[calc(60%+var(--cf-page-padding))] bg-primary" />
            </div>

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
                      {service.description && (
                        <p className="m-0 text-description leading-[var(--cf-body-line-height)] text-muted-foreground">
                          {service.description}
                        </p>
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
        <VenueFooter venueName={shipName} address={venue.address} phone={venue.phone} />
      </div>

      <div className="h-safe-bottom" />
    </div>
  );
}
