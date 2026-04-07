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
  /** CSS var overrides applied when the OS prefers dark color scheme. */
  darkMode?: React.CSSProperties;
  children: React.ReactNode;
}

export function VenueThemeProvider({ theme, darkMode, children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!darkMode) return;
    const darkBg = (darkMode as Record<string, string>)["--background"] ?? "";

    const apply = (dark: boolean) => {
      setIsDark(dark);
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
