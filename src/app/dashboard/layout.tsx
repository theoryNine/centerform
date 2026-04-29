import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth, signOut } from "@/lib/auth";
import { getVenuesForUser } from "@/lib/permissions";
import { NavLink } from "@/components/dashboard/nav-link";
import { VenueSwitcher } from "@/components/dashboard/venue-switcher";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const memberships = await getVenuesForUser(session.user.id);

  if (memberships.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have access to any venues yet.
          </p>
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();
  const cookieVenueId = cookieStore.get("active-venue-id")?.value;
  const active = memberships.find((m) => m.venue.id === cookieVenueId) ?? memberships[0];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/30 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold tracking-tight">Centerform</span>
        </div>

        <div className="border-b">
          <VenueSwitcher venues={memberships} activeVenueId={active.venue.id} />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavLink href="/dashboard" exact>
            Overview
          </NavLink>

          <div className="py-2">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </p>
            <NavLink href="/dashboard/venue">Venue Settings</NavLink>
            <NavLink href="/dashboard/venue/services">Services</NavLink>
            <NavLink href="/dashboard/venue/events">Events</NavLink>
            <NavLink href="/dashboard/venue/places">Nearby Places</NavLink>
            <NavLink href="/dashboard/venue/explore">Explore Collections</NavLink>
          </div>

          <Separator />

          <div className="py-2">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settings
            </p>
            <NavLink href="/dashboard/venue/amenities">Amenities</NavLink>
            <NavLink href="/dashboard/venue/info">Hotel Info</NavLink>
          </div>
        </nav>

        <div className="border-t p-4">
          <p className="truncate px-3 py-1 text-xs text-muted-foreground">{session.user.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MobileNav venues={memberships} activeVenueId={active.venue.id} />
            <h2 className="text-sm font-medium text-muted-foreground">{active.venue.name}</h2>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/sign-in" });
            }}
          >
            <Button variant="ghost" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
