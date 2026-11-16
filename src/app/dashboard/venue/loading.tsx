import { ListSkeleton } from "@/components/dashboard/list-parts";

// Shown while a dashboard page's data loads: skeleton rows the same height as real list rows.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <div className="bg-muted h-7 w-48 animate-pulse rounded" />
        <div className="bg-muted h-4 w-72 animate-pulse rounded" />
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
      <ListSkeleton rows={6} />
    </div>
  );
}
