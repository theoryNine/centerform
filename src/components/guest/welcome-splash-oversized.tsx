"use client";

import { useState, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

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
  const [pressed, setPressed] = useState(false);

  return (
    <div className="relative size-full overflow-hidden bg-background font-sans">
      {/* Image — absolutely positioned, bleeds off top and bottom edges */}
      <div
        className="absolute left-0 overflow-hidden rounded-r-[50%]"
        style={{ top: "-40px", height: "115%", width: "85%" }}
      >
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={name} className="size-full object-cover" />
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
          <div className="card-shadow relative rounded-default bg-card px-4 py-6 text-center">
            <span
              className="absolute inline-block h-4 w-4 border-l-2 border-t-2 border-foreground/25"
              style={{ top: 10, left: 10 }}
            />
            <span
              className="absolute inline-block h-4 w-4 border-r-2 border-t-2 border-foreground/25"
              style={{ top: 10, right: 10 }}
            />
            <span
              className="absolute inline-block h-4 w-4 border-b-2 border-l-2 border-foreground/25"
              style={{ bottom: 10, left: 10 }}
            />
            <span
              className="absolute inline-block h-4 w-4 border-b-2 border-r-2 border-foreground/25"
              style={{ bottom: 10, right: 10 }}
            />
            <h1 className="m-0 font-serif text-hotel-name font-normal leading-tight text-foreground">
              {name}
            </h1>
            <div className="mx-auto my-3 h-px w-10 bg-foreground/20" />
            {tagline && (
              <p className="m-0 text-body leading-[var(--cf-body-line-height)] text-muted-foreground">
                {tagline}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onEnter}
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onMouseLeave={() => setPressed(false)}
              onTouchStart={() => setPressed(true)}
              onTouchEnd={() => setPressed(false)}
              className="flex cursor-pointer items-center gap-2 rounded-default border-none bg-foreground px-8 py-3.5 text-cta-button font-semibold text-background transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: pressed ? "scale(0.97)" : "scale(1)" }}
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
