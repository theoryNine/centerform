"use client";

import { Phone } from "lucide-react";
import { useDirtyForm } from "@/components/dashboard/dirty-form";

export const DEFAULT_WELCOME_BODY =
  "We’re glad you’re here. Everything you need for your stay is right below.";
export const DEFAULT_PHONE_LABEL = "Call the Front Desk";

interface GuestPreviewProps {
  /** Saved venue name, used when the Name field is empty. */
  venueName: string;
}

// An illustration of the guest home hero, driven by the General form's current values. Not an
// iframe: it only mirrors the pieces these fields control (cover image, location, name, message,
// call button) and falls back to the same defaults as the guest site.
export function GuestPreview({ venueName }: GuestPreviewProps) {
  const { values } = useDirtyForm();
  const name = values.name?.trim() || venueName;
  const location = [values.city?.trim(), values.state?.trim()].filter(Boolean).join(" · ");
  const cover = values.cover_image_url?.trim();
  const message = values.welcome_body?.trim() || DEFAULT_WELCOME_BODY;
  const phone = values.phone?.trim();
  const buttonLabel = values.phone_label?.trim() || DEFAULT_PHONE_LABEL;

  return (
    <section aria-labelledby="guest-preview-heading" className="space-y-3">
      <h2 id="guest-preview-heading" className="text-sm font-semibold">
        Guest preview
      </h2>

      <div
        aria-hidden
        className="overflow-hidden rounded-[28px] border-4 border-neutral-900 bg-neutral-900 text-white shadow-md"
      >
        <div className="space-y-4 pt-5 pb-6">
          <div className="h-36 w-[80%] overflow-hidden rounded-r-[40%] bg-neutral-700">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="space-y-2 px-5">
            {location && (
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                {location}
              </p>
            )}
            <p className="text-2xl leading-tight font-semibold">{name}</p>
            <p className="text-sm leading-relaxed whitespace-pre-line text-white/80">{message}</p>
            {phone && (
              <p className="pt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
                  <Phone size={14} />
                  {buttonLabel}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Updates as you type. Uses the default message for blank fields.
      </p>
    </section>
  );
}
