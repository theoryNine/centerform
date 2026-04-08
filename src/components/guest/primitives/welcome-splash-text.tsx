"use client";

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { CornerBracketCard } from "@/components/guest/primitives/corner-bracket-card";
import { usePressScale } from "@/hooks/use-press-scale";
import { LoadingSpinner } from "@/components/guest/primitives/loading-spinner";
import { useImageLoaded } from "@/hooks/use-image-loaded";

interface WelcomeSplashTextProps {
  name: string;
  tagline?: ReactNode;
  coverImageUrl?: string;
  fallbackContent?: ReactNode;
  onEnter: () => void;
}

export function WelcomeSplashText({
  name,
  tagline = "Your stay begins here",
  coverImageUrl,
  fallbackContent,
  onEnter,
}: WelcomeSplashTextProps) {
  const pressHandlers = usePressScale();
  const { loaded, imgRef, settle } = useImageLoaded(coverImageUrl);

  return (
    <div className="flex size-full flex-col overflow-hidden bg-background font-sans">
      {!loaded && <LoadingSpinner />}
      {/* Image — in-flow, bleeds off top edge, rounded right */}
      <div
        className="relative shrink-0 overflow-hidden rounded-r-[50%]"
        style={{ height: "calc(57vh + 40px)", width: "85%", marginTop: "-40px" }}
      >
        {coverImageUrl ? (
          <img
            ref={imgRef}
            src={coverImageUrl}
            alt={name}
            className="size-full object-cover"
            onLoad={settle}
            onError={settle}
          />
        ) : (
          fallbackContent
        )}
      </div>

      {/* Card + button — below image, pushed right */}
      <div className="flex flex-1 flex-col justify-center pl-[22%] pr-6">
        <CornerBracketCard>
          <h1 className="m-0 font-serif text-hotel-name font-normal leading-tight text-foreground">
            {name}
          </h1>
          <div className="mx-auto my-3 h-px w-10 bg-foreground/20" />
          {tagline && (
            <p className="m-0 text-body leading-[var(--cf-body-line-height)] text-muted-foreground">
              {tagline}
            </p>
          )}
        </CornerBracketCard>

        <div className="mt-5 flex justify-center">
          <button
            onClick={onEnter}
            {...pressHandlers}
            className="flex cursor-pointer items-center gap-2 rounded-default border-none bg-foreground px-8 py-3.5 text-cta-button font-semibold text-background transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            Enter
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
