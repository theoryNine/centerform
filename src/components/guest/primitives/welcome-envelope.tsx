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
    <div className="relative flex size-full flex-col overflow-hidden bg-gradient-to-b from-[#1a1612] to-[#0d0b09] font-sans">
      {/* Ambient light */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 size-[400px] -translate-x-1/2"
        style={{
          background: `radial-gradient(circle, rgba(212,180,131,${0.06 * breathe}) 0%, transparent 60%)`,
        }}
      />

      {/* The Envelope - centered */}
      <div className="flex flex-1 flex-col items-center justify-center px-7">
        {/* Envelope body */}
        <div className="relative w-full max-w-[320px]">
          {/* Envelope back flap (opened) */}
          <div
            className="absolute -top-[50px] left-[12%] right-[12%] h-[70px] origin-bottom [transform:rotateX(180deg)]"
            style={{
              background: "linear-gradient(180deg, #d4c4a8 0%, #c4b498 100%)",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              boxShadow: "0 -5px 20px rgba(0,0,0,0.3)",
            }}
          />

          {/* Wax seal */}
          <div
            className="absolute -top-6 left-1/2 z-20 flex size-11 -translate-x-1/2 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, #8B2635 0%, #6B1D29 50%, #4A1520 100%)",
              boxShadow: `
                0 4px 12px rgba(139,38,53,0.5),
                0 0 ${16 + breathe * 12}px rgba(139,38,53,${0.3 * breathe}),
                inset 0 2px 4px rgba(255,255,255,0.2)
              `,
            }}
          >
            <span className="font-serif text-base font-semibold text-white/90">
              {initial}
            </span>
          </div>

          {/* Main envelope */}
          <div
            className="rounded p-0.5"
            style={{
              background: "linear-gradient(180deg, #e8dcc8 0%, #d4c4a8 100%)",
              boxShadow: `
                0 25px 60px rgba(0,0,0,0.4),
                0 10px 30px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.5)
              `,
            }}
          >
            {/* The Letter */}
            <div className="relative rounded-sm bg-[#FFFEF8] px-7 pb-10 pt-13 text-center shadow-[inset_0_0_30px_rgba(0,0,0,0.02)]">
              {/* Paper texture */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Letter content */}
              <div className="relative z-[1]">
                <div className="mb-5 text-[11px] font-semibold uppercase tracking-[3px] text-[#8B7355]">
                  {hotelName}
                </div>

                <div className="mb-3 font-serif text-[28px] italic leading-snug text-[#2C2416]">
                  Welcome
                </div>

                <div className="mb-8 text-sm leading-relaxed text-[#6B5D4D]">
                  {tagline}
                </div>

                {/* Divider */}
                <div
                  className="mx-auto h-px w-[50px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, #C4B498, transparent)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enter button */}
      <div className="flex justify-center px-8 pb-14 pt-8">
        <button
          onClick={onEnter}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          className="flex cursor-pointer items-center gap-3 rounded-full border-none px-8 py-4 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            background: "linear-gradient(135deg, #D4B483 0%, #C4A473 100%)",
            boxShadow: `
              0 4px 16px rgba(212,180,131,0.3),
              0 0 ${20 + breathe * 15}px rgba(212,180,131,${0.2 * breathe})
            `,
            transform: pressed ? "scale(0.97)" : "scale(1)",
          }}
        >
          <span className="text-[15px] font-semibold tracking-wide text-[#1a1612]">
            Enter
          </span>
          <ArrowIcon size={18} color="#1a1612" />
        </button>
      </div>
    </div>
  );
}
