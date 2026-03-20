import { notFound } from "next/navigation";
import { VenueThemeProvider } from "@/components/theme-provider";
import { SlugProvider } from "@/components/slug-context";
import { resolveSlug } from "@/lib/slug-resolver";
import type { ThemeColors } from "@/types";

const defaultTheme: ThemeColors = {
  primary_color: "#1A7A6D",
  secondary_color: "#EDE8DE",
  accent_color: "#D4B483",
  background_color: "#F5F0E8",
  foreground_color: "#2D2A26",
  font_family: "Inter",
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

  return (
    <SlugProvider value={resolved}>
      <VenueThemeProvider theme={theme}>
        {children}
      </VenueThemeProvider>
    </SlugProvider>
  );
}
