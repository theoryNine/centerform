"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Copy, Check } from "lucide-react";
import type { Service, Venue } from "@/types";

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

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--primary, #1A7A6D)",
      }}
    >
      {label && <span>{label}</span>}
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

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
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "var(--muted-foreground, #8B8680)",
            marginBottom: 4,
          }}
        >
          Network
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--foreground, #2D2A26)",
            }}
          >
            {network}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--border, #DDD8CE)",
          marginBottom: 16,
        }}
      />

      {/* Password row — full-width tap target */}
      <button
        onClick={handleCopyPassword}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "var(--muted-foreground, #8B8680)",
              marginBottom: 4,
            }}
          >
            Password
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--foreground, #2D2A26)",
            }}
          >
            {password}
          </span>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--primary, #1A7A6D)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
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
    <div
      style={{
        borderBottom: "1px solid var(--border, #DDD8CE)",
        marginLeft: -20,
        marginRight: -20,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "16px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "var(--foreground, #2D2A26)",
          }}
        >
          {title}
        </span>
        <ChevronDown
          size={18}
          style={{
            color: "var(--muted-foreground, #8B8680)",
            transition: "transform 0.25s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </button>
      <div
        style={{
          overflow: "hidden",
          transition: "height 0.25s ease",
          height: isOpen ? contentHeight : 0,
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function buildMapUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

interface VenueServicesPageProps {
  venue: Venue;
  services: Service[];
  slug: string;
}

export function VenueServicesPage({ venue, services, slug }: VenueServicesPageProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [activeSection, setActiveSection] = useState("room");
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll listener for sticky nav visibility
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setShowStickyNav(rect.bottom <= 0);
      }

      // Determine active section based on scroll position
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
    <div
      className="min-h-screen"
      style={{
        background: "var(--background, #F5F0E8)",
        fontFamily: "var(--font-sans, 'Inter', -apple-system, sans-serif)",
      }}
    >
      {/* Sticky nav — hidden until scroll past header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--background, #F5F0E8)",
          transform: showStickyNav ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        <div
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          {/* Sticky header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
            }}
          >
            <Link
              href={`/${slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                color: "var(--primary, #1A7A6D)",
                textDecoration: "none",
                marginRight: 12,
              }}
            >
              <ArrowLeft size={20} />
            </Link>
            <span
              style={{
                fontSize: 16,
                fontWeight: 400,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: "var(--foreground, #2D2A26)",
              }}
            >
              {venueName}
            </span>
          </div>

          {/* Section tabs */}
          <div
            style={{
              display: "flex",
              gap: 0,
              padding: "0 20px 12px",
            }}
          >
            {SECTION_CONFIG.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  borderRadius: 20,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background:
                    activeSection === section.id
                      ? "var(--primary, #1A7A6D)"
                      : "transparent",
                  color:
                    activeSection === section.id
                      ? "var(--primary-foreground, #FFFFFF)"
                      : "var(--foreground, #2D2A26)",
                }}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Divider line — only visible with sticky nav */}
          <div
            style={{
              height: 1,
              background: "var(--border, #DDD8CE)",
            }}
          />
        </div>
      </div>

      {/* Main header area */}
      <div ref={headerRef}>
        {/* Top bar with back arrow and venue name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px",
          }}
        >
          <Link
            href={`/${slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--primary, #1A7A6D)",
              textDecoration: "none",
              marginRight: 12,
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <Link
            href={`/${slug}`}
            style={{
              fontSize: 16,
              fontWeight: 400,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: "var(--foreground, #2D2A26)",
              textDecoration: "none",
            }}
          >
            {venueName}
          </Link>
        </div>

        {/* Hero: image + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            minHeight: 180,
          }}
        >
          {/* Image — flush left, rounded right */}
          <div
            style={{
              width: "40%",
              minWidth: 140,
              maxWidth: 180,
              height: 180,
              borderRadius: "0 50% 50% 0",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {venue.cover_image_url ? (
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
                  background:
                    "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 50%, #A09680 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 40,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 300,
                  }}
                >
                  {venueName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
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
                fontSize: 26,
                fontWeight: 400,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: "var(--foreground, #2D2A26)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Your Room
              <br />
              &amp; Stay
            </h1>
          </div>
        </div>

        {/* Section tabs (inline, before subheader) */}
        <div
          style={{
            display: "flex",
            gap: 0,
            padding: "20px 20px 0",
          }}
        >
          {SECTION_CONFIG.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                borderRadius: 20,
                cursor: "pointer",
                transition: "all 0.2s ease",
                background:
                  activeSection === section.id
                    ? "var(--primary, #1A7A6D)"
                    : "transparent",
                color:
                  activeSection === section.id
                    ? "var(--primary-foreground, #FFFFFF)"
                    : "var(--foreground, #2D2A26)",
              }}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Subheader: address, hours, checkout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "16px 20px",
            gap: 16,
            fontSize: 12,
            color: "var(--muted-foreground, #8B8680)",
          }}
        >
          <div>
            {venue.address && (
              <a
                href={buildMapUrl(fullAddress)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--primary, #1A7A6D)",
                  textDecoration: "none",
                  fontWeight: 500,
                  lineHeight: 1.4,
                  display: "block",
                }}
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
          <div style={{ textAlign: "right", lineHeight: 1.5 }}>
            <div>Front Desk: 7am–10pm</div>
            <div style={{ fontWeight: 600, color: "var(--foreground, #2D2A26)" }}>
              Check out by 11:00 AM
            </div>
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <div style={{ padding: "0 20px 40px" }}>
        {sectionServices.map((section) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
          >
            {/* Section header */}
            <div style={{ padding: "24px 0 8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--primary, #1A7A6D)",
                    fontFamily: "var(--font-sans, 'Inter', sans-serif)",
                  }}
                >
                  {section.number}
                </span>
                <span style={{ color: "var(--muted-foreground, #8B8680)", fontSize: 12 }}>
                  ·
                </span>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: "var(--foreground, #2D2A26)",
                    margin: 0,
                  }}
                >
                  {section.title}
                </h2>
              </div>
              <div
                style={{
                  marginLeft: -20,
                  width: "calc(60% + 20px)",
                  height: 1,
                  background: "var(--primary, #1A7A6D)",
                  marginTop: 8,
                }}
              />
            </div>

            {/* Accordion card */}
            <div
              style={{
                background: "var(--card, #FFFFFF)",
                borderRadius: 5,
                padding: "0 20px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
              }}
            >
              {section.services.length === 0 ? (
                <div
                  style={{
                    padding: "24px 0",
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--muted-foreground, #8B8680)",
                  }}
                >
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
                        <WifiContent
                          network={wifiInfo.network}
                          password={wifiInfo.password}
                        />
                      ) : (
                        service.description && (
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--muted-foreground, #8B8680)",
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
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

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "0 20px 16px",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 400,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: "var(--foreground, #2D2A26)",
            marginBottom: 4,
          }}
        >
          {venueName}
        </div>
        <div
          style={{
            fontSize: 13,
            fontStyle: "italic",
            color: "var(--muted-foreground, #8B8680)",
            marginBottom: 8,
          }}
        >
          If you need anything at all
        </div>
        {venue.phone && (
          <a
            href={`tel:${venue.phone.replace(/\D/g, "")}`}
            style={{
              fontSize: 14,
              color: "var(--primary, #1A7A6D)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {venue.phone}
          </a>
        )}
      </div>

      {/* Bottom safe area */}
      <div style={{ height: "env(safe-area-inset-bottom, 20px)" }} />
    </div>
  );
}
