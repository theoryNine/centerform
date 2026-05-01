"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "@/components/dashboard/nav-link";
import { VenueSwitcher } from "@/components/dashboard/venue-switcher";
import type { MemberRole, Venue } from "@/types";

interface MobileNavProps {
  venues: Array<{ venue: Venue; role: MemberRole }>;
  activeVenueId: string;
}

export function MobileNav({ venues, activeVenueId }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetHeader className="flex h-14 flex-row items-center border-b px-4">
            <SheetTitle className="text-sm font-semibold tracking-tight">Centerform</SheetTitle>
          </SheetHeader>

          <div className="border-b">
            <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
          </div>

          {/* Close sheet when any nav link is tapped */}
          <nav className="flex-1 space-y-1 p-4" onClick={() => setOpen(false)}>
            <NavLink href="/dashboard" exact>
              Overview
            </NavLink>

            <div className="py-2">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hotel
              </p>
              <NavLink href="/dashboard/venue" exact>Settings</NavLink>
              <NavLink href="/dashboard/venue/amenities">Amenities</NavLink>
              <NavLink href="/dashboard/venue/services">Services</NavLink>
              <NavLink href="/dashboard/venue/events">Events</NavLink>
              <NavLink href="/dashboard/venue/info">Hotel Info</NavLink>
            </div>

            <Separator />

            <div className="py-2">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Places
              </p>
              <NavLink href="/dashboard/venue/places">Nearby Places</NavLink>
              <NavLink href="/dashboard/venue/explore">Explore Collections</NavLink>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
