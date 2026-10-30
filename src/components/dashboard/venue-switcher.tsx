"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchVenueAction } from "@/app/dashboard/actions";
import type { MemberRole, Venue } from "@/types";

interface VenueSwitcherProps {
  venues: Array<{ venue: Venue; role: MemberRole }>;
  activeVenueId: string;
}

export function VenueSwitcher({ venues, activeVenueId }: VenueSwitcherProps) {
  const router = useRouter();
  const active = venues.find((m) => m.venue.id === activeVenueId) ?? venues[0];

  if (venues.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{active.venue.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{active.role}</span>
        </div>
      </div>
    );
  }

  async function handleSwitch(venueId: string) {
    await switchVenueAction(venueId);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-accent transition-colors outline-none">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">{active.venue.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{active.role}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {venues.map(({ venue, role }) => (
          <DropdownMenuItem
            key={venue.id}
            onSelect={() => handleSwitch(venue.id)}
            className="flex items-center gap-2"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">{venue.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{role}</span>
            </div>
            {venue.id === activeVenueId && <Check className="h-4 w-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
