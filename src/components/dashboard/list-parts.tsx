"use client";

import { useEffect, useId, useState } from "react";
import { ChevronRight, ImageIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Chips ---------------------------------------------------------------------------------
// Status chips show exceptions only (Draft, Featured, Collection, Today, Hidden): never a chip
// for the normal state. Every tone is at least 4.5:1 on the cream page background.

type ChipTone = "neutral" | "featured" | "accent";
const CHIP_TONES: Record<ChipTone, string> = {
  neutral: "border-border bg-muted text-foreground",
  featured: "border-amber-300 bg-amber-100 text-amber-950",
  accent: "border-primary bg-primary text-primary-foreground",
};

export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: ChipTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        CHIP_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

// --- Toolbar -------------------------------------------------------------------------------

export interface FilterOption {
  key: string;
  label: string;
}

interface ListToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  /** Accessible name and placeholder for the search box, e.g. "Search services". */
  searchLabel: string;
  filters?: FilterOption[];
  filter?: string;
  onFilter?: (key: string) => void;
  filterLabel?: string;
  /** "12 services": announced politely whenever it changes. */
  countText: string;
}

export function ListToolbar({
  search,
  onSearch,
  searchLabel,
  filters,
  filter,
  onFilter,
  filterLabel = "Filter",
  countText,
}: ListToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 md:max-w-sm">
          <Search
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label={searchLabel}
            placeholder={searchLabel}
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 h-11 w-full rounded-md border pr-10 pl-9 text-sm shadow-xs outline-none focus-visible:ring-[3px] md:h-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearch("")}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-[3px]"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <p aria-live="polite" className="text-muted-foreground ml-auto text-sm">
          {countText}
        </p>
      </div>

      {filters && filters.length > 1 && (
        <div role="group" aria-label={filterLabel} className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const pressed = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={pressed}
                onClick={() => onFilter?.(f.key)}
                className={cn(
                  "inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors outline-none md:h-9",
                  "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  pressed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-muted",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Groups and rows -----------------------------------------------------------------------

export function ListGroup({
  heading,
  count,
  children,
}: {
  /** Omit for a single ungrouped list. */
  heading?: string;
  count?: number;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={heading ? id : undefined} className="space-y-2">
      {heading && (
        <h2
          id={id}
          className="text-muted-foreground text-sm font-semibold tracking-wider uppercase"
        >
          {heading}
          {count !== undefined && (
            <span className="ml-2 font-normal tracking-normal normal-case">{count}</span>
          )}
        </h2>
      )}
      <Card className="py-0">
        <CardContent className="p-0">
          <ul className="divide-y">{children}</ul>
        </CardContent>
      </Card>
    </section>
  );
}

interface ListRowProps {
  title: string;
  meta?: string;
  /** Thumbnail, date tile or icon tile. */
  leading?: React.ReactNode;
  chips?: React.ReactNode;
  onOpen: () => void;
}

/** The whole row is one button that opens the edit sheet. Delete lives in the sheet. */
export function ListRow({ title, meta, leading, chips, onOpen }: ListRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group hover:bg-muted/60 focus-visible:ring-primary flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
      >
        {leading}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{title}</span>
            {chips}
          </span>
          {meta && <span className="text-muted-foreground block truncate text-xs">{meta}</span>}
        </span>
        <ChevronRight
          aria-hidden
          className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-colors"
        />
      </button>
    </li>
  );
}

/** An <img> that is replaced by `fallback` if there is no URL or the file fails to load. */
export function SafeImage({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

/** 56px rounded thumbnail, or a neutral placeholder with an icon: never a broken image. */
export function Thumb({
  src,
  icon: Icon = ImageIcon,
  alt = "",
}: {
  src?: string | null;
  icon?: React.ComponentType<{ className?: string }>;
  alt?: string;
}) {
  return (
    <span className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px]">
      <SafeImage
        src={src}
        alt={alt}
        className="size-full object-cover"
        fallback={<Icon aria-hidden className="size-6" />}
      />
    </span>
  );
}

/** 56px month-over-day tile for events. */
export function DateTile({ month, day }: { month: string; day: string }) {
  return (
    <span
      aria-hidden
      className="bg-primary/10 text-foreground flex size-14 shrink-0 flex-col items-center justify-center rounded-[10px] leading-none"
    >
      <span className="text-[11px] font-semibold tracking-wider">{month}</span>
      <span className="mt-1 text-xl font-bold">{day}</span>
    </span>
  );
}

// --- Empty, no results, loading ------------------------------------------------------------

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Icon aria-hidden className="size-6" />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-md text-sm">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-1 h-10">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function NoResults({
  query,
  onClear,
  message,
  clearLabel,
}: {
  query: string;
  onClear: () => void;
  /** Text for when nothing is searched but a filter hides everything, e.g. "No upcoming events." */
  message?: string;
  clearLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="text-muted-foreground text-sm">
          {query ? `No matches for “${query}”.` : (message ?? "Nothing matches these filters.")}
        </p>
        <Button variant="outline" className="h-10" onClick={onClear}>
          {query ? "Clear search" : (clearLabel ?? "Show all")}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card aria-hidden className="py-0">
      <CardContent className="p-0">
        <ul className="divide-y">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="flex min-h-16 items-center gap-3 px-4 py-3">
              <span className="bg-muted size-14 shrink-0 animate-pulse rounded-[10px]" />
              <span className="flex-1 space-y-2">
                <span className="bg-muted block h-3.5 w-1/3 animate-pulse rounded" />
                <span className="bg-muted block h-3 w-2/3 animate-pulse rounded" />
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
