import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/lib/dashboard-checklist";

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="bg-muted h-2 overflow-hidden rounded-full"
    >
      <div
        className="bg-primary h-full rounded-full transition-[width]"
        style={{ width: `${max === 0 ? 0 : (value / max) * 100}%` }}
      />
    </div>
  );
}

export function ChecklistRow({ item }: { item: ChecklistItem }) {
  if (item.done) {
    // Finished rows are history: shown on larger screens only, with no hint or action.
    return (
      <li className="flex min-h-11 items-center gap-3 py-2 max-md:hidden">
        <span
          aria-hidden
          className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="text-muted-foreground text-sm line-through">{item.title}</span>
        <span className="sr-only">(done)</span>
      </li>
    );
  }

  return (
    <li className="relative flex min-h-14 items-center gap-3 py-2 md:min-h-11">
      <span
        aria-hidden
        className="border-muted-foreground/50 size-6 shrink-0 rounded-full border-2"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-muted-foreground text-xs">{item.hint}</p>
      </div>
      {/* On phones the link's ::after stretches over the whole row, so the row is the tap target. */}
      <Link
        href={item.href}
        className={cn(
          "text-primary dark:text-ring inline-flex min-h-11 shrink-0 items-center rounded-md px-2 text-sm font-medium outline-none",
          "focus-visible:ring-ring/50 hover:underline focus-visible:ring-[3px]",
          "after:absolute after:inset-0 md:after:hidden",
        )}
      >
        {item.actionLabel}
      </Link>
    </li>
  );
}

export function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  const done = items.filter((i) => i.done).length;
  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>
            <h2 className="text-base">Finish setting up</h2>
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {done} of {items.length} done
          </p>
        </div>
        <ProgressBar value={done} max={items.length} label="Setup progress" />
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
