"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { ThemeColors } from "@/types";

function hexToOklch(hex: string): string {
  // For now, pass through the hex value directly as CSS color
  // In production, you'd convert to oklch for consistency with shadcn/ui
  return hex;
}

interface ThemeProviderProps {
  theme: ThemeColors;
  /** CSS var overrides applied when the OS prefers dark color scheme. */
  darkMode?: React.CSSProperties;
  children: React.ReactNode;
}

export function VenueThemeProvider({ theme, darkMode, children }: ThemeProviderProps) {
  const darkBg = darkMode ? (darkMode as Record<string, string>)["--background"] ?? "" : "";

  // Initialize synchronously from matchMedia so the first client render is already correct,
  // avoiding a light→dark flash before useEffect would fire.
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined" || !darkMode) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Set body background before paint so the status bar area matches the page.
  useLayoutEffect(() => {
    if (!darkMode) return;
    document.body.style.backgroundColor = isDark ? darkBg : "";
  }, [isDark, darkMode, darkBg]);

  // Keep in sync with system preference changes.
  useEffect(() => {
    if (!darkMode) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
      document.body.style.backgroundColor = "";
    };
  }, [darkMode]);

  const lightStyle = {
    "--primary": hexToOklch(theme.primary_color),
    "--secondary": hexToOklch(theme.secondary_color),
    "--accent": hexToOklch(theme.accent_color),
    "--background": hexToOklch(theme.background_color),
    "--foreground": hexToOklch(theme.foreground_color),
    "--radius": theme.border_radius ?? "0.625rem",
    "--font-sans": theme.font_family ?? "DM Sans",
  } as React.CSSProperties;

  const style = isDark && darkMode ? { ...lightStyle, ...darkMode } : lightStyle;

  return (
    <div style={style} className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
