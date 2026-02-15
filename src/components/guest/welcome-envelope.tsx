"use client";

import { useState, useEffect } from "react";

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

interface WelcomeEnvelopeProps {
  hotelName: string;
  tagline?: string;
  hotelInitial?: string;
  onEnter: () => void;
}

export function WelcomeEnvelope({
  hotelName,
  tagline = "Your stay begins here",
  hotelInitial,
  onEnter,
}: WelcomeEnvelopeProps) {
  const [time, setTime] = useState(0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 0.02), 50);
    return () => clearInterval(interval);
  }, []);

  const breathe = 0.5 + Math.sin(time * 0.8) * 0.2;
  const initial = hotelInitial ?? hotelName.charAt(0);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #1a1612 0%, #0d0b09 100%)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ambient light */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          background: `radial-gradient(circle, rgba(212,180,131,${0.06 * breathe}) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* The Envelope - centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
        }}
      >
        {/* Envelope body */}
        <div
          style={{
            width: "100%",
            maxWidth: 320,
            position: "relative",
          }}
        >
          {/* Envelope back flap (opened) */}
          <div
            style={{
              position: "absolute",
              top: -50,
              left: "12%",
              right: "12%",
              height: 70,
              background: "linear-gradient(180deg, #d4c4a8 0%, #c4b498 100%)",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              transform: "rotateX(180deg)",
              transformOrigin: "bottom center",
              boxShadow: "0 -5px 20px rgba(0,0,0,0.3)",
            }}
          />

          {/* Wax seal */}
          <div
            style={{
              position: "absolute",
              top: -24,
              left: "50%",
              transform: "translateX(-50%)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8B2635 0%, #6B1D29 50%, #4A1520 100%)",
              boxShadow: `
                0 4px 12px rgba(139,38,53,0.5),
                0 0 ${16 + breathe * 12}px rgba(139,38,53,${0.3 * breathe}),
                inset 0 2px 4px rgba(255,255,255,0.2)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              {initial}
            </span>
          </div>

          {/* Main envelope */}
          <div
            style={{
              background: "linear-gradient(180deg, #e8dcc8 0%, #d4c4a8 100%)",
              borderRadius: 4,
              padding: 3,
              boxShadow: `
                0 25px 60px rgba(0,0,0,0.4),
                0 10px 30px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.5)
              `,
            }}
          >
            {/* The Letter */}
            <div
              style={{
                background: "#FFFEF8",
                borderRadius: 2,
                padding: "52px 28px 40px",
                boxShadow: "inset 0 0 30px rgba(0,0,0,0.02)",
                position: "relative",
                textAlign: "center",
              }}
            >
              {/* Paper texture */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                  pointerEvents: "none",
                }}
              />

              {/* Letter content */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 3,
                    color: "#8B7355",
                    textTransform: "uppercase",
                    marginBottom: 20,
                  }}
                >
                  {hotelName}
                </div>

                <div
                  style={{
                    fontSize: 28,
                    color: "#2C2416",
                    lineHeight: 1.3,
                    marginBottom: 12,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  Welcome
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: "#6B5D4D",
                    lineHeight: 1.6,
                    marginBottom: 32,
                  }}
                >
                  {tagline}
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: 50,
                    height: 1,
                    background: "linear-gradient(90deg, transparent, #C4B498, transparent)",
                    margin: "0 auto",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enter button */}
      <div
        style={{
          padding: "32px 32px 56px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={onEnter}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 32px",
            background: "linear-gradient(135deg, #D4B483 0%, #C4A473 100%)",
            border: "none",
            borderRadius: 100,
            cursor: "pointer",
            boxShadow: `
              0 4px 16px rgba(212,180,131,0.3),
              0 0 ${20 + breathe * 15}px rgba(212,180,131,${0.2 * breathe})
            `,
            transform: pressed ? "scale(0.97)" : "scale(1)",
            transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1a1612",
              letterSpacing: 0.5,
            }}
          >
            Enter
          </span>
          <ArrowIcon size={18} color="#1a1612" />
        </button>
      </div>
    </div>
  );
}
