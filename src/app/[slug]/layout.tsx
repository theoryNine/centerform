import { notFound } from "next/navigation";
import { VenueThemeProvider } from "@/components/theme-provider";
import { SlugProvider } from "@/components/slug-context";
import { resolveSlug } from "@/lib/slug-resolver";
import type { ThemeColors } from "@/types";

const defaultTheme: ThemeColors = {
  primary_color: "#1a1a2e",
  secondary_color: "#16213e",
  accent_color: "#e94560",
  background_color: "#ffffff",
  foreground_color: "#0a0a0a",
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
  let displayName: string;

  if (resolved.type === "venue") {
    displayName = resolved.data.name;
    if (resolved.data.venue_themes) {
      theme = resolved.data.venue_themes;
    }
  } else {
    displayName = resolved.data.name;
    if (resolved.data.standalone_event_themes) {
      theme = resolved.data.standalone_event_themes;
    }
  }

  return (
    <SlugProvider value={resolved}>
      <VenueThemeProvider theme={theme}>
        {/* Top bar */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex h-14 items-center justify-center px-4">
            <span className="text-lg font-semibold">{displayName}</span>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="px-4 pt-[calc(3.5rem+1px)] pb-[calc(4rem+env(safe-area-inset-bottom)+1px)]">
          {children}
        </main>
      </VenueThemeProvider>
    </SlugProvider>
  );
}
