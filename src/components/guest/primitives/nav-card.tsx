"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface NavCardProps {
  label: string;
  sublabel: string;
  href: string;
  imageUrl?: string;
  onSettle?: () => void;
}

export function NavCard({ label, sublabel, href, imageUrl, onSettle }: NavCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="card-shadow flex min-h-[116px] w-full cursor-pointer items-center gap-4 overflow-hidden rounded-default border-none bg-card p-0 text-left transition-transform ease-out active:scale-[var(--cf-press-scale)]"
      style={{ transitionDuration: "var(--cf-press-duration)" }}
      onMouseDown={(e) => (e.currentTarget.style.transform = `scale(var(--cf-press-scale))`)}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onTouchStart={(e) => (e.currentTarget.style.transform = `scale(var(--cf-press-scale))`)}
      onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div
        className="relative w-[30%] shrink-0 self-stretch overflow-hidden"
        style={{ background: "linear-gradient(135deg, #D4C4A8 0%, #B8A88C 100%)" }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            onLoad={onSettle}
            onError={onSettle}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1 py-4">
        <div className="mb-0.5 font-serif text-card-title-lg font-normal text-foreground">{label}</div>
        <div className="text-body-sm leading-snug text-muted-foreground">{sublabel}</div>
      </div>
      <ArrowRight size={18} color="var(--primary, #1A7A6D)" className="mr-3 shrink-0" />
    </button>
  );
}

interface SectionDividerProps {
  title: string;
}

export function SectionDivider({ title }: SectionDividerProps) {
  return (
    <div className="mb-heading-gap">
      <h3 className="mb-2 font-serif text-card-title-lg font-normal text-foreground">{title}</h3>
      <div className="-ml-page h-0.5 w-[calc(60%+var(--cf-page-padding))] bg-primary" />
    </div>
  );
}
