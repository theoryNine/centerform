import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/30 md:block">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-bold">Centerform</span>
        </div>
        <nav className="space-y-1 p-4">
          <a
            href="/dashboard"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Overview
          </a>
          <a
            href="/dashboard/venue"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Venue Settings
          </a>
          <a
            href="/dashboard/venue/services"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Services
          </a>
          <a
            href="/dashboard/venue/events"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Events
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <h2 className="text-sm font-medium text-muted-foreground">Dashboard</h2>
          <Button variant="ghost" size="sm">
            Sign Out
          </Button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
