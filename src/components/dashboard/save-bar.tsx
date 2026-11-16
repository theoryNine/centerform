import { Button } from "@/components/ui/button";
import { unsavedLabel } from "@/lib/form-dirty";

interface SaveBarProps {
  /** Number of changed fields. 0 disables both buttons and shows "All changes saved". */
  count: number;
  pending: boolean;
  error?: string | null;
  saveLabel?: string;
  onDiscard: () => void;
}

// Sticky bar at the bottom of the main area. Must sit inside the <form> it saves (the Save button
// is a submit button), as the last child, so `sticky` pins it to the viewport bottom while the
// form is on screen. The negative margins cancel the `p-6` of <main> so the bar is full-bleed.
export function SaveBar({
  count,
  pending,
  error,
  saveLabel = "Save changes",
  onDiscard,
}: SaveBarProps) {
  const dirty = count > 0;
  return (
    <div className="bg-background sticky bottom-0 z-10 -mx-6 mt-6 -mb-6 flex min-h-[72px] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-6 py-3">
      <div className="min-w-0 text-sm" role="status" aria-live="polite">
        {error ? (
          <span role="alert" className="font-medium text-red-700">
            {error}
          </span>
        ) : dirty ? (
          <span className="inline-flex items-center gap-2 font-medium">
            <span aria-hidden className="size-2 rounded-full bg-amber-500" />
            {unsavedLabel(count)}
          </span>
        ) : (
          <span className="text-muted-foreground inline-flex items-center gap-2">
            <span aria-hidden className="size-2 rounded-full bg-emerald-600" />
            All changes saved
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={!dirty || pending}
          onClick={onDiscard}
        >
          Discard
        </Button>
        <Button type="submit" className="h-10" disabled={!dirty || pending}>
          {pending ? "Saving…" : saveLabel}
        </Button>
      </div>
    </div>
  );
}
