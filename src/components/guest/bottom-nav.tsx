"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BellRing, Calendar, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  venueSlug: string;
}

const tabs = [
  { label: "Home", icon: Home, href: "" },
  { label: "Services", icon: BellRing, href: "/services" },
  { label: "Events", icon: Calendar, href: "/events" },
  { label: "Dining", icon: Utensils, href: "/dining" },
];

export function BottomNav({ venueSlug }: BottomNavProps) {
  const pathname = usePathname();
  const base = `/${venueSlug}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const href = `${base}${tab.href}`;
          const isActive =
            tab.href === ""
              ? pathname === base || pathname === `${base}/`
              : pathname.startsWith(href);

          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              {tab.label}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
