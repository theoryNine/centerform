import { notFound } from "next/navigation";
import type { Viewport } from "next";
import { VenueThemeProvider } from "@/components/theme-provider";
import { SlugProvider } from "@/components/slug-context";
import { resolveSlug } from "@/lib/slug-resolver";
import type { ThemeColors } from "@/types";

export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Viewport> {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  const bgColor =
    resolved?.type === "venue"
      ? (resolved.data.venue_themes?.background_color ?? "#F5F0E8")
      : resolved?.type === "event"
        ? (resolved.data.standalone_event_themes?.background_color ?? "#F5F0E8")
        : "#F5F0E8";

  const isCruise = resolved?.type === "venue" && resolved.data.venue_type === "cruise";

  return {
    themeColor: isCruise
      ? [
          { media: "(prefers-color-scheme: light)", color: bgColor },
          { media: "(prefers-color-scheme: dark)", color: "#1C1A17" },
        ]
      : bgColor,
  };
}

// Only structural/neutral tokens — venue brand colors (primary, accent) are intentionally
// excluded so they remain exactly as configured in venue_themes.
const CRUISE_DARK: React.CSSProperties = {
  "--background": "#1C1A17",
  "--foreground": "#EDE8DE",
  "--card": "#252220",
  "--card-foreground": "#EDE8DE",
  "--popover": "#252220",
  "--popover-foreground": "#EDE8DE",
  "--secondary": "#2E2B27",
  "--secondary-foreground": "#EDE8DE",
  "--muted": "#2E2B27",
  "--muted-foreground": "#8B8680",
  "--border": "#3A3632",
  "--input": "#3A3632",
  "--cf-card-shadow": "0 1px 0 rgba(255, 255, 255, 0.04), 0 4px 16px rgba(0, 0, 0, 0.4)",
  "--cf-glass-bg": "rgba(28, 26, 23, 0.9)",
} as React.CSSProperties;

const defaultTheme: ThemeColors = {
  primary_color: "#1A7A6D",
  secondary_color: "#EDE8DE",
  accent_color: "#D4B483",
  background_color: "#F5F0E8",
  foreground_color: "#2D2A26",
  font_family: "DM Sans",
  border_radius: "0.625rem",
  custom_css: null,
};

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved) {
    notFound();
  }

  // Extract theme from resolved entity
  let theme: ThemeColors = defaultTheme;

  if (resolved.type === "venue") {
    if (resolved.data.venue_themes) {
      theme = resolved.data.venue_themes;
    }
  } else {
    if (resolved.data.standalone_event_themes) {
      theme = resolved.data.standalone_event_themes;
    }
  }

  const isCruise = resolved.type === "venue" && resolved.data.venue_type === "cruise";

  return (
    <SlugProvider value={resolved}>
      <VenueThemeProvider theme={theme} darkMode={isCruise ? CRUISE_DARK : undefined}>
        {children}
      </VenueThemeProvider>
    </SlugProvider>
  );
}
