import { VenueThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/guest/bottom-nav";
import type { VenueTheme } from "@/types";

// TODO: Fetch venue + theme from Supabase by slug
const defaultTheme: VenueTheme = {
  id: "demo",
  venue_id: "demo",
  primary_color: "#1a1a2e",
  secondary_color: "#16213e",
  accent_color: "#e94560",
  background_color: "#ffffff",
  foreground_color: "#0a0a0a",
  font_family: "Inter",
  border_radius: "0.625rem",
  custom_css: null,
  created_at: "",
  updated_at: "",
};

export default async function VenueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ venueSlug: string }>;
}) {
  const { venueSlug } = await params;

  // TODO: Replace with Supabase query:
  // const { data: venue } = await supabase
  //   .from('venues')
  //   .select('*, venue_themes(*)')
  //   .eq('slug', venueSlug)
  //   .single();

  const venueName = venueSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <VenueThemeProvider theme={defaultTheme}>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center justify-center px-4">
          <span className="text-lg font-semibold">{venueName}</span>
        </div>
      </header>

      {/* Scrollable content area */}
      <main className="px-4 pt-[calc(3.5rem+1px)] pb-[calc(4rem+env(safe-area-inset-bottom)+1px)]">
        {children}
      </main>

      <BottomNav venueSlug={venueSlug} />
    </VenueThemeProvider>
  );
}
