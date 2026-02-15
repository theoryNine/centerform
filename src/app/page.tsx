"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ArrowIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function RootPage() {
  const [venueCode, setVenueCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [time, setTime] = useState(0);
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 0.02), 50);
    return () => clearInterval(interval);
  }, []);

  const breathe = 0.5 + Math.sin(time * 0.8) * 0.2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = venueCode.trim().toLowerCase().replace(/\s+/g, "-");
    if (slug) {
      router.push(`/${slug}`);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a1612 0%, #0d0b09 100%)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ambient light */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          background: `radial-gradient(circle, rgba(212,180,131,${0.06 * breathe}) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Wax seal as logo */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8B2635 0%, #6B1D29 50%, #4A1520 100%)",
          boxShadow: `
            0 4px 16px rgba(139,38,53,0.5),
            0 0 ${20 + breathe * 15}px rgba(139,38,53,${0.3 * breathe}),
            inset 0 2px 4px rgba(255,255,255,0.2)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          C
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          marginTop: 24,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 3,
          color: "#8B7355",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 1,
        }}
      >
        Centerform
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 12,
          fontSize: 14,
          color: "#6B5D4D",
          lineHeight: 1.6,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        Scan a QR code at your venue to get started
      </div>

      {/* Divider with text */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 16,
          width: "100%",
          maxWidth: 280,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, transparent, #C4B498, transparent)",
          }}
        />
        <span style={{ fontSize: 11, color: "#6B5D4D", whiteSpace: "nowrap" }}>
          or enter venue code
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, transparent, #C4B498, transparent)",
          }}
        />
      </div>

      {/* Input + button */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 20,
          display: "flex",
          gap: 8,
          width: "100%",
          maxWidth: 280,
          position: "relative",
          zIndex: 1,
        }}
      >
        <input
          value={venueCode}
          onChange={(e) => setVenueCode(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. the-grand-hotel"
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${focused ? "rgba(212,180,131,0.4)" : "rgba(196,180,152,0.15)"}`,
            borderRadius: 100,
            color: "#e8dcc8",
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.2s ease",
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={!venueCode.trim()}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            background: venueCode.trim()
              ? "linear-gradient(135deg, #D4B483 0%, #C4A473 100%)"
              : "rgba(255,255,255,0.05)",
            border: venueCode.trim() ? "none" : "1px solid rgba(196,180,152,0.15)",
            borderRadius: "50%",
            cursor: venueCode.trim() ? "pointer" : "default",
            boxShadow: venueCode.trim()
              ? `0 4px 16px rgba(212,180,131,0.3), 0 0 ${20 + breathe * 15}px rgba(212,180,131,${0.15 * breathe})`
              : "none",
            transform: pressed && venueCode.trim() ? "scale(0.93)" : "scale(1)",
            transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease",
            flexShrink: 0,
          }}
        >
          <ArrowIcon size={18} color={venueCode.trim() ? "#1a1612" : "#6B5D4D"} />
        </button>
      </form>
    </div>
  );
}
