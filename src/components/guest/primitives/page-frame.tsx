import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * "wide"   — responsive layouts: fluid below 1200px, then a centered 1200px frame (1120px of
 *            content inside the gutters). Gutters follow `--cf-page-padding` (20/32/40px).
 * "narrow" — the phone layout, centered in a 600px column, with phone gutters at every width.
 *            Use for pages that have no wide design yet.
 */
export type PageFrameWidth = "wide" | "narrow";

// Narrow frames pin the gutter to the phone value so content doesn't get inset twice on tablets.
const FRAME_CLASSES: Record<PageFrameWidth, string> = {
  wide: "mx-auto w-full max-w-frame",
  narrow: "mx-auto w-full max-w-frame-narrow [--cf-page-padding:20px]",
};

interface PageFrameProps {
  width?: PageFrameWidth;
  /** Extra classes on the outer (full-width, page-background) element. */
  className?: string;
  /** Takes the page out of the tab order and accessibility tree (e.g. behind a modal splash). */
  inert?: boolean;
  children: ReactNode;
}

/** Page root for every guest page: full-width background with the content frame inside. */
export function PageFrame({ width = "narrow", className, inert, children }: PageFrameProps) {
  return (
    <div className={cn("min-h-screen bg-background font-sans", className)} inert={inert}>
      <div className={FRAME_CLASSES[width]}>{children}</div>
    </div>
  );
}

interface FrameInnerProps {
  width?: PageFrameWidth;
  className?: string;
  children: ReactNode;
}

/**
 * Aligns the content of a full-width fixed bar (sticky nav, scroll-reveal header) with the
 * frame. The bar keeps `fixed inset-x-0` and its background; this goes inside it.
 */
export function FrameInner({ width = "narrow", className, children }: FrameInnerProps) {
  return <div className={cn(FRAME_CLASSES[width], className)}>{children}</div>;
}
