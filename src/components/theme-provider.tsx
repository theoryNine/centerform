"use client";

import { useEffect, useState } from "react";
import type { ThemeColors } from "@/types";

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
  const brandStyle = {
    "--primary": hexToOklch(theme.primary_color),
    "--secondary": hexToOklch(theme.secondary_color),
    "--accent": hexToOklch(theme.accent_color),
    "--radius": theme.border_radius ?? "0.625rem",
    "--font-sans": theme.font_family ?? "Source Sans 3",
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
