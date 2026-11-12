"use client";

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { CornerBracketCard } from "@/components/guest/primitives/corner-bracket-card";
import { usePressScale } from "@/hooks/use-press-scale";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { useImageLoaded } from "@/hooks/use-image-loaded";

interface WelcomeSplashOversizedProps {
  name: string;
  tagline?: ReactNode;
  coverImageUrl?: string;
  fallbackContent?: ReactNode;
  onEnter: () => void;
}

export function WelcomeSplashOversized({
  name,
  tagline = "Your stay begins here",
  coverImageUrl,
  fallbackContent,
  onEnter,
}: WelcomeSplashOversizedProps) {
  const pressHandlers = usePressScale();
  const { loaded, imgRef, settle } = useImageLoaded(coverImageUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      className="relative size-full overflow-hidden bg-background font-sans"
    >
      {!loaded && <LoadingSpinner />}
      {/*
        Image — absolutely positioned, bleeds off top and bottom edges.
        Portrait (default): a tall oval, 88% wide from 600px. Landscape (splash-land): a half-oval
        filling the left 54% (48% on a short phone) at full height.
      */}
      <div className="absolute left-[-40px] top-[-50px] h-[115%] w-[95%] overflow-hidden rounded-r-[50%] splash-port:cmp:w-[88%] splash-land:left-0 splash-land:top-0 splash-land:h-full splash-land:w-[54%] splash-short:w-[48%]">
        {coverImageUrl ? (
          <img
            ref={imgRef}
            src={coverImageUrl}
            alt={name}
            className="size-full object-cover object-top"
            onLoad={settle}
            onError={settle}
          />
        ) : (
          fallbackContent
        )}
      </div>

      {/*
        Card + button. Portrait: float over the lower half, pushed right (phone); from 600px the
        stack is centered on the photo with the card capped at 440px. Landscape: centered in the
        dark panel to the right of the photo.
      */}
      <div className="absolute bottom-0 left-0 right-0 top-1/2 flex flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] pl-[22%] pr-6 splash-port:cmp:pl-0 splash-port:cmp:pr-0 splash-land:left-[54%] splash-land:top-0 splash-land:pb-0 splash-land:pl-0 splash-land:pr-0 splash-short:left-[48%]">
        <div className="flex flex-1 flex-col justify-center gap-5 splash-port:cmp:w-[88%] splash-land:items-center splash-land:px-8 splash-short:gap-3 splash-short:px-4">
          <CornerBracketCard className="splash-port:cmp:mx-auto splash-port:cmp:w-full splash-port:cmp:max-w-[440px] splash-land:w-full splash-lap:max-w-[480px] splash-lap:[--cf-bracket-size:20px] splash-mid:max-w-[440px] splash-short:max-w-[360px] splash-short:py-4 splash-short:[--cf-bracket-size:14px]">
            {/* Plain classes (not cn): tailwind-merge would drop the custom text-hotel-name size. */}
            <h1 className="m-0 font-serif text-hotel-name font-semibold leading-tight text-foreground splash-port:cmp:text-[38px] splash-port:tab:text-[44px] splash-mid:text-[48px] splash-lap:text-[56px]">
              {name}
            </h1>
            {tagline && (
              <p className="m-0 mt-2 text-body leading-[var(--cf-body-line-height)] text-muted-foreground">
                {tagline}
              </p>
            )}
            <div className="mx-auto my-3 h-px w-10 bg-foreground/20 splash-short:hidden" />
          </CornerBracketCard>

          <div className="flex justify-center">
            <button
              onClick={onEnter}
              autoFocus
              {...pressHandlers}
              className="flex cursor-pointer items-center gap-2 rounded-default border-none bg-foreground px-8 py-3.5 text-cta-button font-semibold text-background transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] splash-lap:py-4 splash-short:py-3"
            >
              Enter
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
