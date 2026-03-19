"use client";

import type { ThemeColors } from "@/types";

function hexToOklch(hex: string): string {
  // For now, pass through the hex value directly as CSS color
  // In production, you'd convert to oklch for consistency with shadcn/ui
  return hex;
}

interface ThemeProviderProps {
  theme: ThemeColors;
  children: React.ReactNode;
}

export function VenueThemeProvider({ theme, children }: ThemeProviderProps) {
  const style = {
    "--primary": hexToOklch(theme.primary_color),
    "--secondary": hexToOklch(theme.secondary_color),
    "--accent": hexToOklch(theme.accent_color),
    "--background": hexToOklch(theme.background_color),
    "--foreground": hexToOklch(theme.foreground_color),
    "--radius": theme.border_radius ?? "0.625rem",
    "--font-sans": theme.font_family ?? "Inter",
  } as React.CSSProperties;

  return (
    <div style={style} className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
