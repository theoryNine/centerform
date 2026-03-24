import { resolveSlug } from "@/lib/slug-resolver";
import { getVenueEvents } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";

function formatEventDate(startTime: string, endTime: string | null) {
  const start = new Date(startTime);
  const date = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const events = await getVenueEvents(resolved.data.id);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <div className="pt-safe px-5">
        <Link
          href={`/${slug}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="mb-5">
          <h1 className="mb-2 font-serif text-[22px] font-normal text-foreground">
            Events & Activities
          </h1>
          <div className="h-0.5 w-3/5 rounded-sm bg-primary" />
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          What&apos;s happening in and around the venue.
        </p>
      </div>

      {/* Content */}
      <div className="px-5 pb-10">
        {events.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No upcoming events at the moment.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="card-shadow rounded-[5px] bg-card p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="m-0 text-[15px] font-semibold text-foreground">
                    {event.title}
                  </p>
                  {event.is_featured && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      <Star size={10} />
                      Featured
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {event.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={12} />
                      {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {formatEventDate(event.start_time, event.end_time)}
                  </span>
                </div>
                {event.description && (
                  <p className="mb-0 mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
