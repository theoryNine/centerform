"use client";

import { Check, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/dashboard/color-picker";
import { DirtyForm, FieldLabel, useDirtyForm } from "@/components/dashboard/dirty-form";
import { FontPicker } from "@/components/dashboard/font-picker";
import { DEFAULT_WELCOME_BODY } from "@/components/dashboard/guest-preview";
import {
  CREAM_BACKGROUND,
  contrastOnCream,
  isHex,
  readableOn,
  readableTextOn,
} from "@/lib/contrast";
import { updateVenueThemeAction } from "@/app/dashboard/venue/actions";
import type { VenueTheme } from "@/types";

type ThemeValues = Pick<
  VenueTheme,
  | "primary_color"
  | "secondary_color"
  | "accent_color"
  | "font_family"
  | "heading_font_family"
  | "border_radius"
>;

const DEFAULTS = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  accent: "#e94560",
  heading: "Nunito Sans",
  body: "Source Sans 3",
  radius: "0.625rem",
};
const CSS_LENGTH = /^\d+(\.\d+)?(rem|px|em)$/;

// Primary is the only color used for text (links), so it is the only one checked: against the
// cream background, with the ratio and a pass or fail. Saving is never blocked. The guest site
// darkens a failing primary for link text on its own, which the note says.
function PrimaryColorField({ defaultValue }: { defaultValue: string }) {
  const { values } = useDirtyForm();
  const primary = values.primary_color ?? defaultValue;
  const result = contrastOnCream(primary);
  const darkenedForLinks =
    result &&
    !result.passes &&
    readableOn(primary, [CREAM_BACKGROUND, "#FFFFFF"], "darker") !== primary;
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor="primary_color" name="primary_color">
        Primary color
      </FieldLabel>
      <ColorPicker id="primary_color" name="primary_color" defaultValue={defaultValue} />
      {result && (
        <p
          className={`flex items-start gap-1.5 text-xs ${result.passes ? "text-muted-foreground" : "text-amber-900 dark:text-amber-300"}`}
        >
          {result.passes ? (
            <Check aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          )}
          <span>
            <span className="font-semibold">{result.ratio.toFixed(2)}:1</span> on the cream
            background.{" "}
            {result.passes
              ? "Passes AA for normal text."
              : "Below the 4.5:1 minimum for normal text."}
            {darkenedForLinks &&
              " Guests will see a slightly darker link color so text stays readable."}
          </span>
        </p>
      )}
    </div>
  );
}

// A small illustration of the guest site in the venue's own colors, fonts and corner radius.
function BrandPreview({
  venueName,
  welcomeHeading,
  welcomeBody,
  theme,
}: {
  venueName: string;
  welcomeHeading: string | null;
  welcomeBody: string | null;
  theme: ThemeValues | null;
}) {
  const { values } = useDirtyForm();
  const pick = (
    name: string,
    fallback: string | null | undefined,
    ok: (v: string) => boolean,
    last: string,
  ) => {
    const v = values[name]?.trim();
    if (v && ok(v)) return v;
    return fallback && ok(fallback) ? fallback : last;
  };
  const primary = pick("primary_color", theme?.primary_color, isHex, DEFAULTS.primary);
  const secondary = pick("secondary_color", theme?.secondary_color, isHex, DEFAULTS.secondary);
  const accent = pick("accent_color", theme?.accent_color, isHex, DEFAULTS.accent);
  const radius = pick(
    "border_radius",
    theme?.border_radius,
    (v) => CSS_LENGTH.test(v),
    DEFAULTS.radius,
  );
  const headingFont = values.heading_font_family || theme?.heading_font_family || DEFAULTS.heading;
  const bodyFont = values.font_family || theme?.font_family || DEFAULTS.body;
  const link = readableOn(primary, [CREAM_BACKGROUND, "#FFFFFF"], "darker");

  return (
    <section aria-labelledby="brand-preview-heading" className="space-y-3">
      <h2 id="brand-preview-heading" className="text-sm font-semibold">
        Preview
      </h2>
      <div
        aria-hidden
        className="space-y-4 border p-5 shadow-sm"
        style={{
          background: CREAM_BACKGROUND,
          color: "#2a2723",
          borderRadius: radius,
          fontFamily: `"${bodyFont}", sans-serif`,
        }}
      >
        <span
          className="inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase"
          style={{ background: accent, color: readableTextOn(accent), borderRadius: radius }}
        >
          Tonight
        </span>
        <div>
          <p
            className="text-2xl leading-tight font-semibold"
            style={{ fontFamily: `"${headingFont}", serif` }}
          >
            {welcomeHeading?.trim() || "Welcome."}
          </p>
          <p
            className="mt-1 text-lg font-semibold"
            style={{ fontFamily: `"${headingFont}", serif` }}
          >
            {venueName}
          </p>
        </div>
        <p className="text-sm leading-relaxed">{welcomeBody?.trim() || DEFAULT_WELCOME_BODY}</p>
        <div
          className="flex items-center justify-between px-4 py-3 text-sm"
          style={{ background: secondary, color: readableTextOn(secondary), borderRadius: radius }}
        >
          <span>Check-in</span>
          <span className="font-semibold">3:00 PM</span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="inline-flex h-10 items-center px-5 text-sm font-semibold"
            style={{ background: primary, color: readableTextOn(primary), borderRadius: radius }}
          >
            Call the Front Desk
          </span>
          <span className="text-sm font-semibold underline" style={{ color: link }}>
            Explore the area
          </span>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        Updates as you change colors, fonts and corners. Text on buttons switches between light and
        dark so it stays readable.
      </p>
    </section>
  );
}

export function VenueThemeForm({
  venueId,
  venueName,
  welcomeHeading,
  welcomeBody,
  theme,
}: {
  venueId: string;
  venueName: string;
  welcomeHeading: string | null;
  welcomeBody: string | null;
  theme: ThemeValues | null;
}) {
  return (
    <DirtyForm formKey="branding" action={updateVenueThemeAction}>
      <input type="hidden" name="venueId" value={venueId} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Your brand colors across the guest site.</CardDescription>
            </CardHeader>
            <CardContent className="@container grid gap-4">
              <div className="grid gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
                <PrimaryColorField defaultValue={theme?.primary_color ?? DEFAULTS.primary} />
                <div className="space-y-2">
                  <FieldLabel htmlFor="secondary_color" name="secondary_color">
                    Secondary color
                  </FieldLabel>
                  <ColorPicker
                    id="secondary_color"
                    name="secondary_color"
                    defaultValue={theme?.secondary_color ?? DEFAULTS.secondary}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="accent_color" name="accent_color">
                    Accent color
                  </FieldLabel>
                  <ColorPicker
                    id="accent_color"
                    name="accent_color"
                    defaultValue={theme?.accent_color ?? DEFAULTS.accent}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fonts and shape</CardTitle>
              <CardDescription>How text and corners look to guests.</CardDescription>
            </CardHeader>
            <CardContent className="@container grid gap-4">
              <div className="grid gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel htmlFor="heading_font_family" name="heading_font_family">
                    Heading font
                  </FieldLabel>
                  <FontPicker
                    id="heading_font_family"
                    name="heading_font_family"
                    defaultValue={theme?.heading_font_family ?? DEFAULTS.heading}
                    variant="heading"
                    venueName={venueName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="font_family" name="font_family">
                    Body font
                  </FieldLabel>
                  <FontPicker
                    id="font_family"
                    name="font_family"
                    defaultValue={theme?.font_family ?? DEFAULTS.body}
                    variant="body"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="border_radius" name="border_radius">
                    Border radius
                  </FieldLabel>
                  <Input
                    id="border_radius"
                    name="border_radius"
                    defaultValue={theme?.border_radius ?? DEFAULTS.radius}
                    placeholder="0.625rem"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6">
          <BrandPreview
            venueName={venueName}
            welcomeHeading={welcomeHeading}
            welcomeBody={welcomeBody}
            theme={theme}
          />
        </div>
      </div>
    </DirtyForm>
  );
}
