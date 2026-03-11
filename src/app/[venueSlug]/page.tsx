"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { WelcomeEnvelope } from "@/components/guest/welcome-envelope";
import {
  Compass,
  Calendar,
  MessageCircle,
  Key,
  Wifi,
  Copy,
  Check,
  ChevronRight,
  Music,
  Phone,
  Clock,
  MapPin,
  X,
} from "lucide-react";

function formatVenueName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// --- Color tokens (matching landing page) ---
const colors = {
  bg: "#1a1612",
  bgDeep: "#0d0b09",
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(196,180,152,0.12)",
  cardHover: "rgba(255,255,255,0.07)",
  gold: "#D4B483",
  goldMuted: "#C4B498",
  goldDim: "#8B7355",
  cream: "#e8dcc8",
  muted: "#6B5D4D",
  sealRed: "#8B2635",
  white05: "rgba(255,255,255,0.05)",
  white10: "rgba(255,255,255,0.1)",
  white20: "rgba(255,255,255,0.2)",
};

// --- Drawer snap points (vh) ---
const DRAWER_HEIGHT_VH = 94;
const COLLAPSED_TRANSLATE_VH = 56; // shows ~38vh of drawer
const EXPANDED_TRANSLATE_VH = 0; // shows full drawer
const SNAP_VELOCITY_THRESHOLD = 0.3; // vh/ms

export default function VenueHomePage() {
  const { venueSlug } = useParams<{ venueSlug: string }>();
  const router = useRouter();
  const venueName = formatVenueName(venueSlug);

  // Welcome envelope state
  const [envelopeDismissed, setEnvelopeDismissed] = useState(false);
  const [envelopeVisible, setEnvelopeVisible] = useState(true);

  // Drawer state
  const [translateY, setTranslateY] = useState(COLLAPSED_TRANSLATE_VH);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startY: 0, startTranslate: 0, lastY: 0, lastTime: 0 });
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"info" | "amenities">("info");
  const [copied, setCopied] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Desktop detection
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // On desktop, always show expanded
  useEffect(() => {
    if (isDesktop) setTranslateY(EXPANDED_TRANSLATE_VH);
  }, [isDesktop]);

  const isExpanded = translateY <= EXPANDED_TRANSLATE_VH + 5;

  // --- Envelope handlers ---
  function handleEnvelopeEnter() {
    setEnvelopeDismissed(true);
    setTimeout(() => setEnvelopeVisible(false), 500);
  }

  // --- Drawer touch/mouse handlers ---
  const handleDragStart = useCallback(
    (clientY: number) => {
      // If content is scrolled down and drawer is expanded, don't start drag
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

    // Calculate velocity
    const now = Date.now();
    const dt = now - dragRef.current.lastTime || 1;
    const dy = ((dragRef.current.lastY - dragRef.current.startY) / window.innerHeight) * 100;
    const velocity = dy / dt; // vh/ms

    // Snap based on velocity or position
    if (Math.abs(velocity) > SNAP_VELOCITY_THRESHOLD) {
      setTranslateY(velocity > 0 ? COLLAPSED_TRANSLATE_VH : EXPANDED_TRANSLATE_VH);
    } else {
      const midpoint = (COLLAPSED_TRANSLATE_VH + EXPANDED_TRANSLATE_VH) / 2;
      setTranslateY(translateY > midpoint ? COLLAPSED_TRANSLATE_VH : EXPANDED_TRANSLATE_VH);
    }
  }, [isDragging, translateY]);

  // Touch events
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY),
    [handleDragStart],
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY),
    [handleDragMove],
  );
  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  // Mouse events (desktop drag testing)
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

  // --- Copy WiFi password ---
  async function copyPassword() {
    try {
      await navigator.clipboard.writeText("Welcome2024!");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // --- Placeholder data (TODO: fetch from Supabase) ---
  const venueInfo = {
    frontDesk: "+1 (555) 123-4567",
    receptionHours: "24 hours",
    address: "100 Grand Avenue, New York, NY 10001",
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
    wifiNetwork: `${venueName} Guest`,
    wifiPassword: "Welcome2024!",
    notification: "Live jazz in the lobby tonight at 7 PM",
  };

  const amenities = [
    { name: "Swimming Pool", hours: "6:00 AM – 10:00 PM" },
    { name: "Fitness Center", hours: "24 hours" },
    { name: "Spa & Wellness", hours: "9:00 AM – 8:00 PM" },
    { name: "Business Center", hours: "7:00 AM – 11:00 PM" },
    { name: "Restaurant", hours: "6:30 AM – 10:30 PM" },
    { name: "Rooftop Bar", hours: "5:00 PM – 1:00 AM" },
  ];

  const quickAccess = [
    {
      label: "Explore",
      sublabel: "Discover nearby",
      icon: Compass,
      href: `/${venueSlug}/dining`,
      gradient: "linear-gradient(135deg, #2a4a3e 0%, #1a332a 100%)",
      iconColor: "#6bcba0",
    },
    {
      label: "Events",
      sublabel: "Today's activities",
      icon: Calendar,
      href: `/${venueSlug}/events`,
      gradient: "linear-gradient(135deg, #3a2a4a 0%, #2a1a3a 100%)",
      iconColor: "#b39ddb",
    },
    {
      label: "Concierge",
      sublabel: "Ask anything",
      icon: MessageCircle,
      href: `/${venueSlug}/concierge`,
      gradient: "linear-gradient(135deg, #4a3a2a 0%, #3a2a1a 100%)",
      iconColor: colors.gold,
    },
    {
      label: "Your Stay",
      sublabel: "Coming soon",
      icon: Key,
      href: `/${venueSlug}`,
      gradient: "linear-gradient(135deg, #2a3a4a 0%, #1a2a3a 100%)",
      iconColor: "#7eb8d8",
    },
  ];

  return (
    <>
      {/* Welcome envelope overlay */}
      {envelopeVisible && (
        <div
          className="fixed inset-0 z-[100]"
          style={{
            opacity: envelopeDismissed ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <WelcomeEnvelope
            hotelName={venueName}
            tagline="Your stay begins here"
            onEnter={handleEnvelopeEnter}
          />
        </div>
      )}

      {/* Full-screen venue home */}
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
          {/* Venue name overlay at top */}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Wax seal mini */}
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
                  {venueName.charAt(0)}
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
                  {venueName}
                </div>
                <div style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                  Your digital concierge
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder hotel image text */}
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
              {venueName.charAt(0)}
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
              Venue Photo
            </div>
          </div>
        </div>

        {/* Drawer */}
        <div
          ref={drawerRef}
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
            {/* Event notification */}
            {!notificationDismissed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "linear-gradient(135deg, rgba(212,180,131,0.12) 0%, rgba(212,180,131,0.06) 100%)",
                  border: `1px solid rgba(212,180,131,0.2)`,
                  borderRadius: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(212,180,131,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Music size={16} color={colors.gold} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.gold, marginBottom: 1 }}>
                    Happening Soon
                  </div>
                  <div style={{ fontSize: 13, color: colors.cream, lineHeight: 1.4 }}>
                    {venueInfo.notification}
                  </div>
                </div>
                <button
                  onClick={() => setNotificationDismissed(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    flexShrink: 0,
                  }}
                >
                  <X size={14} color={colors.muted} />
                </button>
              </div>
            )}

            {/* WiFi card */}
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
                    background: "rgba(107,203,160,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Wifi size={16} color="#6bcba0" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.cream }}>
                  Hotel WiFi
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: colors.muted }}>Network</span>
                  <span style={{ fontSize: 13, color: colors.cream, fontWeight: 500 }}>
                    {venueInfo.wifiNetwork}
                  </span>
                </div>
                <div
                  style={{
                    height: 1,
                    background: colors.white05,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: colors.muted }}>Password</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: colors.cream,
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontWeight: 500,
                      letterSpacing: 0.5,
                    }}
                  >
                    {venueInfo.wifiPassword}
                  </span>
                </div>
              </div>
              <button
                onClick={copyPassword}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "10px 0",
                  background: copied ? "rgba(107,203,160,0.12)" : colors.white05,
                  border: `1px solid ${copied ? "rgba(107,203,160,0.25)" : colors.cardBorder}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
              >
                {copied ? (
                  <>
                    <Check size={14} color="#6bcba0" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#6bcba0" }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} color={colors.goldDim} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: colors.goldDim }}>
                      Tap to copy password
                    </span>
                  </>
                )}
              </button>
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

            {/* Info / Amenities tabs */}
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  marginBottom: 20,
                  background: colors.white05,
                  borderRadius: 12,
                  padding: 3,
                }}
              >
                {(["info", "amenities"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      background: activeTab === tab ? colors.card : "transparent",
                      border: activeTab === tab ? `1px solid ${colors.cardBorder}` : "1px solid transparent",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: activeTab === tab ? 600 : 400,
                      color: activeTab === tab ? colors.cream : colors.muted,
                      transition: "all 0.2s ease",
                      textTransform: "capitalize",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Info tab content */}
              {activeTab === "info" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[
                    { icon: Phone, label: "Front Desk", value: venueInfo.frontDesk },
                    { icon: Clock, label: "Reception", value: venueInfo.receptionHours },
                    { icon: MapPin, label: "Address", value: venueInfo.address },
                    { icon: Clock, label: "Check-in", value: venueInfo.checkIn },
                    { icon: Clock, label: "Check-out", value: venueInfo.checkOut },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 0",
                        borderBottom: i < 4 ? `1px solid ${colors.white05}` : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: colors.white05,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <item.icon size={15} color={colors.goldDim} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 13, color: colors.cream, fontWeight: 500 }}>
                          {item.value}
                        </div>
                      </div>
                      {item.label === "Front Desk" && (
                        <a
                          href={`tel:${item.value.replace(/\D/g, "")}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: "rgba(107,203,160,0.1)",
                            border: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <Phone size={14} color="#6bcba0" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Amenities tab content */}
              {activeTab === "amenities" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {amenities.map((item, i) => (
                    <div
                      key={item.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        borderBottom: i < amenities.length - 1 ? `1px solid ${colors.white05}` : "none",
                      }}
                    >
                      <div style={{ fontSize: 13, color: colors.cream, fontWeight: 500 }}>
                        {item.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Clock size={12} color={colors.muted} />
                        <span style={{ fontSize: 12, color: colors.muted }}>{item.hours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom padding for safe area */}
              <div style={{ height: "env(safe-area-inset-bottom, 20px)" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
