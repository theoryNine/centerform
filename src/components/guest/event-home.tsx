"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Globe,
  List,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { useStandaloneEvent } from "@/components/slug-context";

// --- Color tokens (matching landing page) ---
const colors = {
  bg: "#1a1612",
  bgDeep: "#0d0b09",
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(196,180,152,0.12)",
  gold: "#D4B483",
  goldDim: "#8B7355",
  cream: "#e8dcc8",
  muted: "#6B5D4D",
  white05: "rgba(255,255,255,0.05)",
  white20: "rgba(255,255,255,0.2)",
};

// --- Drawer snap points (vh) ---
const DRAWER_HEIGHT_VH = 94;
const COLLAPSED_TRANSLATE_VH = 56;
const EXPANDED_TRANSLATE_VH = 0;
const SNAP_VELOCITY_THRESHOLD = 0.3;

const eventTypeLabels: Record<string, string> = {
  conference: "Conference",
  concert: "Concert",
  festival: "Festival",
  wedding: "Wedding",
  gala: "Gala",
  other: "Event",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const event = useStandaloneEvent();

  // Drawer state
  const [translateY, setTranslateY] = useState(COLLAPSED_TRANSLATE_VH);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startY: 0, startTranslate: 0, lastY: 0, lastTime: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  // Desktop detection
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isDesktop) setTranslateY(EXPANDED_TRANSLATE_VH);
  }, [isDesktop]);

  const isExpanded = translateY <= EXPANDED_TRANSLATE_VH + 5;

  // --- Drawer touch/mouse handlers ---
  const handleDragStart = useCallback(
    (clientY: number) => {
      if (contentRef.current && contentRef.current.scrollTop > 0 && isExpanded) return;
      setIsDragging(true);
      dragRef.current = {
        startY: clientY,
        startTranslate: translateY,
        lastY: clientY,
        lastTime: Date.now(),
      };
    },
    [translateY, isExpanded],
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const deltaVh = ((clientY - dragRef.current.startY) / window.innerHeight) * 100;
      const newTranslate = Math.max(
        EXPANDED_TRANSLATE_VH,
        Math.min(COLLAPSED_TRANSLATE_VH, dragRef.current.startTranslate + deltaVh),
      );
      setTranslateY(newTranslate);
      dragRef.current.lastY = clientY;
      dragRef.current.lastTime = Date.now();
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const now = Date.now();
    const dt = now - dragRef.current.lastTime || 1;
    const dy = ((dragRef.current.lastY - dragRef.current.startY) / window.innerHeight) * 100;
    const velocity = dy / dt;

    if (Math.abs(velocity) > SNAP_VELOCITY_THRESHOLD) {
      setTranslateY(velocity > 0 ? COLLAPSED_TRANSLATE_VH : EXPANDED_TRANSLATE_VH);
    } else {
      const midpoint = (COLLAPSED_TRANSLATE_VH + EXPANDED_TRANSLATE_VH) / 2;
      setTranslateY(translateY > midpoint ? COLLAPSED_TRANSLATE_VH : EXPANDED_TRANSLATE_VH);
    }
  }, [isDragging, translateY]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY),
    [handleDragStart],
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY),
    [handleDragMove],
  );
  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientY);
    },
    [handleDragStart],
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Build location string
  const locationParts = [event.address, event.city, event.state].filter(Boolean);
  const locationString = locationParts.join(", ");

  const quickAccess = [
    {
      label: "Schedule",
      sublabel: "View sessions",
      icon: List,
      href: `/${slug}/schedule`,
      gradient: "linear-gradient(135deg, #3a2a4a 0%, #2a1a3a 100%)",
      iconColor: "#b39ddb",
    },
    {
      label: "Info",
      sublabel: "Event details",
      icon: Info,
      href: `/${slug}/info`,
      gradient: "linear-gradient(135deg, #2a4a3e 0%, #1a332a 100%)",
      iconColor: "#6bcba0",
    },
    {
      label: "Concierge",
      sublabel: "Ask anything",
      icon: MessageCircle,
      href: `/${slug}/concierge`,
      gradient: "linear-gradient(135deg, #4a3a2a 0%, #3a2a1a 100%)",
      iconColor: colors.gold,
    },
    {
      label: "Dining",
      sublabel: "Nearby food",
      icon: MapPin,
      href: `/${slug}/dining`,
      gradient: "linear-gradient(135deg, #2a3a4a 0%, #1a2a3a 100%)",
      iconColor: "#7eb8d8",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{
        background: colors.bgDeep,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Hero image area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: isDesktop ? "50vh" : "65vh",
          background: `
            linear-gradient(180deg,
              rgba(26,22,18,0.3) 0%,
              rgba(26,22,18,0) 30%,
              rgba(26,22,18,0) 60%,
              rgba(26,22,18,0.95) 90%,
              ${colors.bg} 100%
            ),
            linear-gradient(135deg, #2a2520 0%, #1a1a2e 30%, #16213e 60%, #1a1612 100%)
          `,
        }}
      >
        {/* Event name overlay at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "env(safe-area-inset-top, 16px) 20px 0",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8B2635 0%, #6B1D29 50%, #4A1520 100%)",
                boxShadow: "0 2px 8px rgba(139,38,53,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                {event.name.charAt(0)}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.cream,
                  letterSpacing: 0.3,
                }}
              >
                {event.name}
              </div>
              <div style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                {eventTypeLabels[event.event_type] || "Event"}
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder event image */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            opacity: 0.15,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: colors.cream,
              fontWeight: 300,
            }}
          >
            {event.name.charAt(0)}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: colors.cream,
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            Event Photo
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${DRAWER_HEIGHT_VH}vh`,
          transform: isDesktop ? "none" : `translateY(${translateY}vh)`,
          transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)",
          borderRadius: "24px 24px 0 0",
          background: colors.bg,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          maxWidth: isDesktop ? 640 : "none",
          marginLeft: isDesktop ? "auto" : undefined,
          marginRight: isDesktop ? "auto" : undefined,
        }}
      >
        {/* Drag handle */}
        {!isDesktop && (
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 12,
              paddingBottom: 8,
              cursor: "grab",
              touchAction: "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: colors.white20,
              }}
            />
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: isDesktop || isExpanded ? "auto" : "hidden",
            padding: isDesktop ? "24px 24px 40px" : "0 20px 40px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Event date & type badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
                color: colors.gold,
                textTransform: "uppercase",
                background: "rgba(212,180,131,0.12)",
                padding: "4px 10px",
                borderRadius: 20,
                border: "1px solid rgba(212,180,131,0.2)",
              }}
            >
              {eventTypeLabels[event.event_type] || "Event"}
            </span>
          </div>

          {/* Key info card */}
          <div
            style={{
              padding: "16px",
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(179,157,219,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calendar size={16} color="#b39ddb" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.cream }}>
                Event Details
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: colors.muted }}>Date</span>
                <span style={{ fontSize: 13, color: colors.cream, fontWeight: 500 }}>
                  {formatDate(event.start_date)}
                  {event.end_date && ` – ${formatDate(event.end_date)}`}
                </span>
              </div>
              <div style={{ height: 1, background: colors.white05 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: colors.muted }}>Time</span>
                <span style={{ fontSize: 13, color: colors.cream, fontWeight: 500 }}>
                  {formatTime(event.start_date)}
                </span>
              </div>
              {locationString && (
                <>
                  <div style={{ height: 1, background: colors.white05 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 12, color: colors.muted, flexShrink: 0 }}>Location</span>
                    <span style={{ fontSize: 13, color: colors.cream, fontWeight: 500, textAlign: "right", marginLeft: 16 }}>
                      {locationString}
                    </span>
                  </div>
                </>
              )}
              {event.phone && (
                <>
                  <div style={{ height: 1, background: colors.white05 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: colors.muted }}>Contact</span>
                    <span style={{ fontSize: 13, color: colors.cream, fontWeight: 500 }}>
                      {event.phone}
                    </span>
                  </div>
                </>
              )}
            </div>
            {event.website && (
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  marginTop: 14,
                  padding: "10px 0",
                  background: colors.white05,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Globe size={14} color={colors.goldDim} />
                <span style={{ fontSize: 13, fontWeight: 500, color: colors.goldDim }}>
                  Visit website
                </span>
                <ExternalLink size={12} color={colors.goldDim} />
              </a>
            )}
          </div>

          {/* Quick Access cards */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 2,
                color: colors.goldDim,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Quick Access
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {quickAccess.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  style={{
                    background: item.gradient,
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: 16,
                    padding: "18px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <item.icon size={22} color={item.iconColor} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.cream }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {item.sublabel}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${colors.cardBorder}, transparent)`,
              marginBottom: 24,
            }}
          />

          {/* Event description */}
          {event.description && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 2,
                  color: colors.goldDim,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                About
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: colors.cream,
                  lineHeight: 1.7,
                  margin: 0,
                  opacity: 0.85,
                }}
              >
                {event.description}
              </p>
            </div>
          )}

          {/* Bottom padding for safe area */}
          <div style={{ height: "env(safe-area-inset-bottom, 20px)" }} />
        </div>
      </div>
    </div>
  );
}
