"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

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

interface SearchOption {
  type: "venue" | "event";
  name: string;
  slug: string;
  city: string | null;
}

export default function RootPage() {
  const [venueCode, setVenueCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [time, setTime] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const debouncedQuery = useDebounce(venueCode.trim(), 300);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 0.02), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setOptions([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    const supabase = createClient();
    const filter = `name.ilike.%${debouncedQuery}%,slug.ilike.%${debouncedQuery}%`;

    Promise.all([
      supabase
        .from("venues")
        .select("name, slug, city")
        .or(filter)
        .limit(4)
        .abortSignal(controller.signal),
      supabase
        .from("standalone_events")
        .select("name, slug, city")
        .or(filter)
        .limit(4)
        .abortSignal(controller.signal),
    ]).then(([venueResult, eventResult]) => {
      if (venueResult.error?.message?.includes("abort")) return;
      if (venueResult.error) {
        console.error("Venue search error:", venueResult.error);
      }
      if (eventResult.error && !eventResult.error.message?.includes("abort")) {
        console.error("Event search error:", eventResult.error);
      }

      const venues: SearchOption[] = (venueResult.data ?? []).map((v) => ({
        ...v,
        type: "venue" as const,
      }));
      const events: SearchOption[] = (eventResult.data ?? []).map((e) => ({
        ...e,
        type: "event" as const,
      }));
      const merged = [...venues, ...events];
      setOptions(merged);
      setShowDropdown(merged.length > 0);
      setIsLoading(false);
      setHighlightedIndex(-1);
    });

    return () => controller.abort();
  }, [debouncedQuery]);

  const breathe = 0.5 + Math.sin(time * 0.8) * 0.2;

  function selectVenue(slug: string) {
    setVenueCode("");
    setShowDropdown(false);
    router.push(`/${slug}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (highlightedIndex >= 0 && options[highlightedIndex]) {
      selectVenue(options[highlightedIndex].slug);
      return;
    }
    const slug = venueCode.trim().toLowerCase().replace(/\s+/g, "-");
    if (slug) {
      router.push(`/${slug}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || options.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a1612] to-[#0d0b09] font-sans">
      {/* Ambient light */}
      <div
        className="pointer-events-none absolute left-1/2 top-[30%] size-[400px] -translate-x-1/2"
        style={{
          background: `radial-gradient(circle, rgba(212,180,131,${0.06 * breathe}) 0%, transparent 60%)`,
        }}
      />

      {/* Logo */}
      <div className="relative z-[1]">
        <Image src="/icons/logo.png" alt="Centerform" width={100} height={100} priority />
      </div>

      {/* Title */}
      <div className="relative z-[1] mt-2 text-[11px] font-semibold uppercase tracking-[3px] text-[#8B7355]">
        Centerform
      </div>

      {/* Tagline */}
      <div className="relative z-[1] mt-3 text-center text-sm leading-relaxed text-[#6B5D4D]">
        Scan a QR code at your venue or event to get started
      </div>

      {/* Divider with text */}
      <div className="relative z-[1] mt-10 flex w-full max-w-[280px] items-center gap-4">
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(90deg, transparent, #C4B498, transparent)" }}
        />
        <span className="whitespace-nowrap text-[11px] text-[#6B5D4D]">
          or search by name
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(90deg, transparent, #C4B498, transparent)" }}
        />
      </div>

      {/* Input + button */}
      <form
        onSubmit={handleSubmit}
        className="relative z-[1] mt-5 flex w-full max-w-[280px] gap-2"
      >
        <div className="relative flex-1">
          <input
            value={venueCode}
            onChange={(e) => setVenueCode(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (options.length > 0) setShowDropdown(true);
            }}
            onBlur={() => {
              setFocused(false);
              // Delay hiding so click on option registers
              setTimeout(() => setShowDropdown(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. the-grand-hotel"
            autoComplete="off"
            className="w-full bg-white/5 px-4 py-3 font-[inherit] text-sm text-[#e8dcc8] outline-none transition-[border-color,border-radius] duration-200 ease-out"
            style={{
              border: `1px solid ${focused ? "rgba(212,180,131,0.4)" : "rgba(196,180,152,0.15)"}`,
              borderRadius: showDropdown || isLoading ? "20px 20px 0 0" : 100,
            }}
          />

          {/* Autocomplete dropdown */}
          {(isLoading || showDropdown) && (
            <ul
              ref={dropdownRef}
              className="absolute inset-x-0 top-full z-10 m-0 list-none overflow-hidden rounded-b-2xl border border-t-0 border-[rgba(212,180,131,0.4)] bg-[rgba(30,26,22,0.98)] p-0"
              style={{
                borderTop: "1px solid rgba(196,180,152,0.1)",
              }}
            >
              {isLoading ? (
                <li className="flex items-center justify-center px-4 py-4">
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(212,180,131,0.5)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </li>
              ) : (
                options.map((option, i) => (
                  <li
                    key={`${option.type}-${option.slug}`}
                    onMouseDown={() => selectVenue(option.slug)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className="cursor-pointer px-4 py-2.5 transition-colors duration-100 ease-out"
                    style={{
                      background:
                        highlightedIndex === i
                          ? "rgba(212,180,131,0.12)"
                          : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#e8dcc8]">
                        {option.name}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                        style={{
                          color: option.type === "event" ? "#b39ddb" : "#6bcba0",
                          background:
                            option.type === "event"
                              ? "rgba(179,157,219,0.12)"
                              : "rgba(107,203,160,0.12)",
                        }}
                      >
                        {option.type === "event" ? "Event" : "Venue"}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#6B5D4D]">
                      {option.city || ""}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={!venueCode.trim()}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          className="flex size-12 shrink-0 items-center justify-center rounded-full transition-[transform,background] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            background: venueCode.trim()
              ? "linear-gradient(135deg, #D4B483 0%, #C4A473 100%)"
              : "rgba(255,255,255,0.05)",
            border: venueCode.trim() ? "none" : "1px solid rgba(196,180,152,0.15)",
            cursor: venueCode.trim() ? "pointer" : "default",
            boxShadow: venueCode.trim()
              ? `0 4px 16px rgba(212,180,131,0.3), 0 0 ${20 + breathe * 15}px rgba(212,180,131,${0.15 * breathe})`
              : "none",
            transform: pressed && venueCode.trim() ? "scale(0.93)" : "scale(1)",
          }}
        >
          <ArrowIcon size={18} color={venueCode.trim() ? "#1a1612" : "#6B5D4D"} />
        </button>
      </form>
    </div>
  );
}
