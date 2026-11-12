"use client";

import { useEffect, useState } from "react";
import type { ThemeColors } from "@/types";
import { readableOn } from "@/lib/contrast";

function hexToOklch(hex: string): string {
  // For now, pass through the hex value directly as CSS color
  // In production, you'd convert to oklch for consistency with shadcn/ui
  return hex;
}

interface ThemeProviderProps {
  theme: ThemeColors;
  /** CSS var overrides applied when dark mode is active. */
  darkMode?: React.CSSProperties;
  /** CSS var overrides applied when light mode is forced (beats CSS @media dark on :root). */
  lightMode?: React.CSSProperties;
  children: React.ReactNode;
}

export function VenueThemeProvider({ theme, darkMode, lightMode, children }: ThemeProviderProps) {
  const colorScheme = theme.color_scheme ?? "system";
  const [systemIsDark, setSystemIsDark] = useState(false);

  useEffect(() => {
    const cast = (obj: React.CSSProperties | undefined) =>
      (obj ?? {}) as Record<string, string>;
    const darkBg = cast(darkMode)["--background"] ?? "";
    const lightBg = cast(lightMode)["--background"] ?? "";

    if (colorScheme === "dark") {
      // Inline script already handled first paint; keep body in sync after hydration.
      document.body.style.backgroundColor = darkBg;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }

    if (colorScheme === "light") {
      // Inline script already handled first paint; keep body in sync after hydration.
      document.body.style.backgroundColor = lightBg;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }

    // system: follow OS preference
    if (!darkMode) return;

    const apply = (dark: boolean) => {
      setSystemIsDark(dark);
      document.body.style.backgroundColor = dark ? darkBg : "";
    };

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
      document.body.style.backgroundColor = "";
    };
  }, [darkMode, lightMode, colorScheme]);

  const isDark = colorScheme === "dark" || (colorScheme === "system" && systemIsDark);

  // --background and --foreground are intentionally omitted from brandStyle.
  // For "system" mode they come from the CSS cascade (:root in globals.css) so the
  // dark @media rule fires before any JS. For forced modes they are applied via the
  // inline <script> in layout.tsx (first paint) and via the style prop below (after
  // hydration), beating the CSS cascade without causing a flash.
  useEffect(() => {
    const builtIn = new Set(["Nunito Sans", "Source Sans 3"]);
    const inject = (name: string, weights: string) => {
      if (builtIn.has(name)) return;
      const id = `gfont-${name.replace(/\s+/g, "-").toLowerCase()}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, "+")}:wght@${weights}&display=swap`;
      document.head.appendChild(link);
    };
    if (theme.font_family) inject(theme.font_family, "300;400;500;600;700");
    if (theme.heading_font_family) inject(theme.heading_font_family, "300;400;500;600;700");
  }, [theme.font_family, theme.heading_font_family]);

  // Brand colors are chosen per venue, so the raw primary can't be trusted for link *text*: the
  // default teal is only 3:1 on the dark page. Compute a readable variant for each mode; the
  // `text-link` utility (globals.css) picks one by color scheme. A forced scheme gets one value
  // for both. Buttons keep using --primary itself, with --primary-foreground on top.
  const surfaces = (mode: React.CSSProperties | undefined, fallback: [string, string]) => {
    const m = (mode ?? {}) as Record<string, string>;
    return [m["--background"] ?? fallback[0], m["--card"] ?? fallback[1]];
  };
  const linkLight = readableOn(
    theme.primary_color,
    surfaces(lightMode, ["#F5F0E8", "#FFFFFF"]),
    "darker",
  );
  const linkDark = readableOn(
    theme.primary_color,
    surfaces(darkMode, ["#1C1A17", "#252220"]),
    "lighter",
  );

  const brandStyle = {
    "--link-light": colorScheme === "dark" ? linkDark : linkLight,
    "--link-dark": colorScheme === "light" ? linkLight : linkDark,
    "--primary": hexToOklch(theme.primary_color),
    "--secondary": hexToOklch(theme.secondary_color),
    "--accent": hexToOklch(theme.accent_color),
    "--radius": theme.border_radius ?? "0.625rem",
    "--font-sans": theme.font_family ?? "Source Sans 3",
    "--font-serif": theme.heading_font_family ?? "Nunito Sans",
  } as React.CSSProperties;

  let style: React.CSSProperties;
  if (isDark && darkMode) {
    // Dark tokens override brand tokens where they conflict (e.g. --secondary).
    // Brand colors (--primary, --accent) are not in darkMode so they stay as-is.
    style = { ...brandStyle, ...darkMode };
  } else if (colorScheme === "light" && lightMode) {
    // Light tokens reset any :root vars darkened by the @media query.
    // Brand tokens applied on top so venue colors always win.
    style = { ...lightMode, ...brandStyle };
  } else {
    style = brandStyle;
  }

  return (
    <div style={style} className="min-h-screen">
      {children}
    </div>
  );
}
