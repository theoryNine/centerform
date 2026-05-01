import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VenueThemeProvider } from "@/components/theme-provider";
import { SlugProvider } from "@/components/slug-context";
import { resolveSlug } from "@/lib/slug-resolver";
import type { ColorScheme, ThemeColors } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { manifest: `/${slug}/manifest.webmanifest` };
}

// Only structural/neutral tokens — venue brand colors (primary, accent) are intentionally
// excluded so they remain exactly as configured in venue_themes.
const DARK_MODE: React.CSSProperties = {
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

// Mirrors the :root defaults in globals.css — used to override the dark @media query
// when a venue forces light mode on users who have a dark OS preference.
const LIGHT_MODE: React.CSSProperties = {
  "--background": "#F5F0E8",
  "--foreground": "#2D2A26",
  "--card": "#FFFFFF",
  "--card-foreground": "#2D2A26",
  "--popover": "#FFFFFF",
  "--popover-foreground": "#2D2A26",
  "--secondary": "#EDE8DE",
  "--secondary-foreground": "#2D2A26",
  "--muted": "#EDE8DE",
  "--muted-foreground": "#8B8680",
  "--border": "#DDD8CE",
  "--input": "#DDD8CE",
  "--cf-card-shadow": "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)",
  "--cf-glass-bg": "rgba(250, 247, 242, 0.9)",
} as React.CSSProperties;

const defaultTheme: ThemeColors = {
  primary_color: "#1A7A6D",
  secondary_color: "#EDE8DE",
  accent_color: "#D4B483",
  background_color: "#F5F0E8",
  foreground_color: "#2D2A26",
  font_family: "Source Sans 3",
  heading_font_family: "Nunito Sans",
  border_radius: "0.625rem",
  custom_css: null,
  color_scheme: "system",
};

/** Builds the synchronous inline script that sets body background before first paint.
 *
 * CSS vars (--background, --card, etc.) are NOT set here. VenueThemeProvider is an SSR'd
 * Client Component and derives `isDark` synchronously from the `colorScheme` prop, so the
 * wrapper div already carries the correct inline CSS vars in the server-rendered HTML.
 * Setting vars on document.documentElement here would create a hydration mismatch on <html>.
 *
 * What we DO need to set early is body.style.backgroundColor — this controls the browser
 * chrome / status bar area that sits outside the React wrapper div.
 */
function buildColorSchemeScript(colorScheme: ColorScheme): string {
  const cast = (obj: React.CSSProperties) => obj as Record<string, string>;
  const darkBg = cast(DARK_MODE)["--background"];
  const lightBg = cast(LIGHT_MODE)["--background"];

  if (colorScheme === "dark") {
    return `(function(){try{document.body.style.backgroundColor='${darkBg}';}catch(e){}})();`;
  }

  if (colorScheme === "light") {
    // Force body bg to light so the status bar area doesn't show the dark color that the
    // CSS @media rule sets on body { background-color } when the user's OS is dark.
    return `(function(){try{document.body.style.backgroundColor='${lightBg}';}catch(e){}})();`;
  }

  // System (default): only act if the OS prefers dark.
  return `(function(){try{if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.body.style.backgroundColor='${darkBg}';}}catch(e){}})();`;
}

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

  const colorScheme = theme.color_scheme ?? "system";

  return (
    <SlugProvider value={resolved}>
      {/* Runs synchronously during HTML parsing — sets body background and :root CSS vars
          before first paint so the browser chrome matches the intended color scheme
          immediately, without waiting for JS hydration. */}
      <script
        dangerouslySetInnerHTML={{
          __html: buildColorSchemeScript(colorScheme),
        }}
      />
      <VenueThemeProvider theme={theme} darkMode={DARK_MODE} lightMode={LIGHT_MODE}>
        {children}
      </VenueThemeProvider>
    </SlugProvider>
  );
}
