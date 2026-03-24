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
      className="fixed inset-0 z-[60] font-sans"
      style={{ background: colors.bgDeep }}
    >
      {/* Hero image area */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
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
          className="absolute inset-x-0 top-0 px-5"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, #8B2635 0%, #6B1D29 50%, #4A1520 100%)",
                boxShadow: "0 2px 8px rgba(139,38,53,0.4)",
              }}
            >
              <span
                className="font-serif text-sm font-semibold"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {event.name.charAt(0)}
              </span>
            </div>
            <div>
              <div
                className="text-[15px] font-semibold tracking-wide"
                style={{ color: colors.cream }}
              >
                {event.name}
              </div>
              <div className="mt-px text-[11px]" style={{ color: colors.muted }}>
                {eventTypeLabels[event.event_type] || "Event"}
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder event image */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-15">
          <div
            className="font-serif text-[64px] font-light"
            style={{ color: colors.cream }}
          >
            {event.name.charAt(0)}
          </div>
          <div
            className="mt-2 text-[10px] uppercase tracking-[4px]"
            style={{ color: colors.cream }}
          >
            Event Photo
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 z-10 flex flex-col rounded-t-3xl"
        style={{
          height: `${DRAWER_HEIGHT_VH}vh`,
          transform: isDesktop ? "none" : `translateY(${translateY}vh)`,
          transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)",
          background: colors.bg,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
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
            className="flex cursor-grab justify-center pb-2 pt-3 touch-none"
          >
            <div
              className="h-1 w-9 rounded-sm"
              style={{ background: colors.white20 }}
            />
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 [-webkit-overflow-scrolling:touch]"
          style={{
            overflowY: isDesktop || isExpanded ? "auto" : "hidden",
            padding: isDesktop ? "24px 24px 40px" : "0 20px 40px",
          }}
        >
          {/* Event date & type badge */}
          <div className="mb-4 flex items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{
                color: colors.gold,
                background: "rgba(212,180,131,0.12)",
                borderColor: "rgba(212,180,131,0.2)",
              }}
            >
              {eventTypeLabels[event.event_type] || "Event"}
            </span>
          </div>

          {/* Key info card */}
          <div
            className="mb-4 rounded-2xl p-4"
            style={{
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <div className="mb-3.5 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[rgba(179,157,219,0.12)]">
                <Calendar size={16} color="#b39ddb" />
              </div>
              <div className="text-sm font-semibold" style={{ color: colors.cream }}>
                Event Details
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: colors.muted }}>Date</span>
                <span className="text-[13px] font-medium" style={{ color: colors.cream }}>
                  {formatDate(event.start_date)}
                  {event.end_date && ` – ${formatDate(event.end_date)}`}
                </span>
              </div>
              <div className="h-px" style={{ background: colors.white05 }} />
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: colors.muted }}>Time</span>
                <span className="text-[13px] font-medium" style={{ color: colors.cream }}>
                  {formatTime(event.start_date)}
                </span>
              </div>
              {locationString && (
                <>
                  <div className="h-px" style={{ background: colors.white05 }} />
                  <div className="flex items-start justify-between">
                    <span className="shrink-0 text-xs" style={{ color: colors.muted }}>Location</span>
                    <span className="ml-4 text-right text-[13px] font-medium" style={{ color: colors.cream }}>
                      {locationString}
                    </span>
                  </div>
                </>
              )}
              {event.phone && (
                <>
                  <div className="h-px" style={{ background: colors.white05 }} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: colors.muted }}>Contact</span>
                    <span className="text-[13px] font-medium" style={{ color: colors.cream }}>
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
                className="mt-3.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] py-2.5 no-underline transition-all duration-200 ease-out"
                style={{
                  background: colors.white05,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <Globe size={14} color={colors.goldDim} />
                <span className="text-[13px] font-medium" style={{ color: colors.goldDim }}>
                  Visit website
                </span>
                <ExternalLink size={12} color={colors.goldDim} />
              </a>
            )}
          </div>

          {/* Quick Access cards */}
          <div className="mb-6">
            <div
              className="mb-3 text-[11px] font-semibold uppercase tracking-[2px]"
              style={{ color: colors.goldDim }}
            >
              Quick Access
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {quickAccess.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="flex cursor-pointer flex-col gap-3 rounded-2xl px-4 pb-4 pt-[18px] text-left transition-transform duration-150 ease-out active:scale-[0.97]"
                  style={{
                    background: item.gradient,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <item.icon size={22} color={item.iconColor} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: colors.cream }}>
                      {item.label}
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: colors.muted }}>
                      {item.sublabel}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            className="mb-6 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.cardBorder}, transparent)`,
            }}
          />

          {/* Event description */}
          {event.description && (
            <div>
              <div
                className="mb-3 text-[11px] font-semibold uppercase tracking-[2px]"
                style={{ color: colors.goldDim }}
              >
                About
              </div>
              <p
                className="m-0 text-sm leading-[1.7] opacity-85"
                style={{ color: colors.cream }}
              >
                {event.description}
              </p>
            </div>
          )}

          {/* Bottom padding for safe area */}
          <div className="h-safe-bottom" />
        </div>
      </div>
    </div>
  );
}
