"use client";

import { useEffect, useState } from "react";

interface FontOption {
  value: string;
  label: string;
  weights: string;
}

const BUILT_IN = new Set(["Nunito Sans", "Source Sans 3"]);

function loadGoogleFont(name: string, weights: string) {
  if (BUILT_IN.has(name)) return;
  const id = `gfont-${name.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, "+")}:wght@${weights}&display=swap`;
  document.head.appendChild(link);
}

export const HEADING_FONTS: FontOption[] = [
  { value: "Nunito Sans", label: "Nunito Sans", weights: "300;400;500;600;700" },
  { value: "Playfair Display", label: "Playfair Display", weights: "400;500;600;700" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", weights: "300;400;500;600;700" },
  { value: "DM Serif Display", label: "DM Serif Display", weights: "400" },
  { value: "Libre Baskerville", label: "Libre Baskerville", weights: "400;700" },
  { value: "Fraunces", label: "Fraunces", weights: "300;400;500;700" },
  { value: "Bodoni Moda", label: "Bodoni Moda", weights: "400;500;600;700" },
  { value: "EB Garamond", label: "EB Garamond", weights: "400;500;600;700" },
  { value: "Spectral", label: "Spectral", weights: "300;400;500;600;700" },
  { value: "Josefin Sans", label: "Josefin Sans", weights: "300;400;600;700" },
  { value: "Raleway", label: "Raleway", weights: "300;400;500;600;700" },
  { value: "Cinzel", label: "Cinzel", weights: "400;500;600;700" },
  { value: "Tenor Sans", label: "Tenor Sans", weights: "400" },
  { value: "Italiana", label: "Italiana", weights: "400" },
  { value: "Poiret One", label: "Poiret One", weights: "400" },
];

export const BODY_FONTS: FontOption[] = [
  { value: "Source Sans 3", label: "Source Sans 3", weights: "300;400;500;600;700" },
  { value: "Inter", label: "Inter", weights: "300;400;500;600;700" },
  { value: "DM Sans", label: "DM Sans", weights: "300;400;500;600;700" },
  { value: "Lato", label: "Lato", weights: "300;400;700" },
  { value: "Mulish", label: "Mulish", weights: "300;400;500;600;700" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", weights: "300;400;500;600;700" },
  { value: "Open Sans", label: "Open Sans", weights: "300;400;500;600;700" },
  { value: "Roboto", label: "Roboto", weights: "300;400;500;700" },
  { value: "Poppins", label: "Poppins", weights: "300;400;500;600;700" },
  { value: "Work Sans", label: "Work Sans", weights: "300;400;500;600;700" },
  { value: "Nunito", label: "Nunito", weights: "300;400;500;600;700" },
  { value: "Karla", label: "Karla", weights: "300;400;500;600;700" },
  { value: "Jost", label: "Jost", weights: "300;400;500;600;700" },
  { value: "Outfit", label: "Outfit", weights: "300;400;500;600;700" },
  { value: "Manrope", label: "Manrope", weights: "300;400;500;600;700" },
];

interface FontPickerProps {
  id: string;
  name: string;
  defaultValue: string;
  variant: "heading" | "body";
}

export function FontPicker({ id, name, defaultValue, variant }: FontPickerProps) {
  const fonts = variant === "heading" ? HEADING_FONTS : BODY_FONTS;
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    fonts.forEach((f) => loadGoogleFont(f.value, f.weights));
  }, [fonts]);

  return (
    <div className="space-y-2">
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      >
        {fonts.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <div
        className="rounded-md border border-border bg-muted/30 px-4 py-3"
        style={{ fontFamily: `"${value}", sans-serif` }}
      >
        {variant === "heading" ? (
          <p className="text-xl font-semibold leading-snug text-foreground">
            Welcome to The Grand Hotel
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">
            Check-in from 3:00 PM · Complimentary breakfast included
          </p>
        )}
      </div>
    </div>
  );
}
