import { resolveSlug } from "@/lib/slug-resolver";
import { getEventScheduleItems } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Clock, MapPin, User } from "lucide-react";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "event") {
    return (
      <div className="min-h-screen bg-background px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">This page is only available for events.</p>
      </div>
    );
  }

  const items = await getEventScheduleItems(resolved.data.id);

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const dayKey = new Date(item.start_time).toDateString();
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(item);
    return acc;
  }, {});

  const days = Object.entries(grouped).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="min-h-screen bg-background font-sans">
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
            Schedule
          </h1>
          <div className="h-0.5 w-3/5 rounded-sm bg-primary" />
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Full event schedule for {resolved.data.name}.
        </p>
      </div>

      <div className="px-5 pb-10">
        {days.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No schedule items yet.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {days.map(([dayKey, dayItems]) => (
              <div key={dayKey}>
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                  {formatDayLabel(dayItems[0].start_time)}
                </h2>
                <div className="flex flex-col gap-3">
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      className="card-shadow rounded-[5px] bg-card p-5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="m-0 text-[15px] font-semibold text-foreground">
                          {item.title}
                        </p>
                        {item.is_featured && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                            <Star size={10} />
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        {item.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            {item.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatTime(item.start_time)}
                          {item.end_time && ` – ${formatTime(item.end_time)}`}
                        </span>
                      </div>
                      {item.speaker && (
                        <span className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <User size={12} />
                          {item.speaker}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
