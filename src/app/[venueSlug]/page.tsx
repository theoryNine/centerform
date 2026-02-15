"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, Calendar, Utensils } from "lucide-react";
import { WelcomeEnvelope } from "@/components/guest/welcome-envelope";

function formatVenueName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function VenueWelcomePage() {
  const { venueSlug } = useParams<{ venueSlug: string }>();
  const venueName = formatVenueName(venueSlug);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(true);

  function handleEnter() {
    setDismissed(true);
    // Wait for fade-out animation, then unmount
    setTimeout(() => setVisible(false), 500);
  }

  return (
    <>
      {/* Welcome envelope overlay */}
      {visible && (
        <div
          className="fixed inset-0 z-[100]"
          style={{
            opacity: dismissed ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <WelcomeEnvelope
            hotelName={venueName}
            tagline="Your stay begins here"
            onEnter={handleEnter}
          />
        </div>
      )}

      {/* Home content (visible after envelope dismissed) */}
      <div className="flex flex-col items-center py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {venueName.charAt(0)}
        </div>

        <h1 className="mt-4 text-xl font-bold">{venueName}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Your personal concierge
        </p>

        {/* Quick action cards */}
        <div className="mt-6 grid w-full max-w-sm gap-3">
          <Link href={`/${venueSlug}/services`}>
            <Card className="transition-shadow hover:shadow-md active:scale-[0.98]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <BellRing className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Services</p>
                  <p className="text-sm text-muted-foreground">
                    Room service, spa, concierge & more
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${venueSlug}/events`}>
            <Card className="transition-shadow hover:shadow-md active:scale-[0.98]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Events</p>
                  <p className="text-sm text-muted-foreground">
                    What&apos;s happening in & around the venue
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${venueSlug}/dining`}>
            <Card className="transition-shadow hover:shadow-md active:scale-[0.98]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Dining</p>
                  <p className="text-sm text-muted-foreground">
                    Restaurants, cafes & bars nearby
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground/60">
          Tip: Add this page to your home screen for quick access
        </p>
      </div>
    </>
  );
}
