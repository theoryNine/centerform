"use client";

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { CornerBracketCard } from "@/components/guest/primitives/corner-bracket-card";
import { usePressScale } from "@/hooks/use-press-scale";

interface WelcomeSplashOversizedProps {
  name: string;
  tagline?: string;
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

  return (
    <div className="relative size-full overflow-hidden bg-background font-sans">
      {/* Image — absolutely positioned, bleeds off top and bottom edges */}
      <div
        className="absolute overflow-hidden rounded-r-[50%]"
        style={{ top: "-50px", height: "115%", width: "95%", left: "-40px" }}
      >
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={name} className="size-full object-cover object-top" />
        ) : (
          fallbackContent
        )}
      </div>

      {/* Card + button — float over the lower portion, pushed right */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col pl-[22%] pr-6 pb-14"
        style={{ top: "50%" }}
      >
        <div className="flex flex-1 flex-col justify-center gap-5">
          <CornerBracketCard>
            <h1 className="m-0 font-serif text-hotel-name font-normal leading-tight text-foreground">
              {name}
            </h1>
            {tagline && (
              <p className="m-0 text-body leading-[var(--cf-body-line-height)] text-muted-foreground">
                {tagline}
              </p>
            )}
            <div className="mx-auto my-3 h-px w-10 bg-foreground/20" />
          </CornerBracketCard>

          <div className="flex justify-center">
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
    </div>
  );
}
