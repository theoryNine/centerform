"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shown when a dashboard page fails to load: an inline banner with Retry instead of a blank page.
export default function VenueError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
    >
      <CircleAlert aria-hidden className="size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">We couldn&apos;t load this page.</p>
        <p className="text-sm">Check your connection and try again.</p>
      </div>
      <Button variant="outline" className="h-10 bg-white" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
