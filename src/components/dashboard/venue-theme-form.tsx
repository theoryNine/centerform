"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/dashboard/color-picker";
import { DirtyForm, FieldLabel, useDirtyForm } from "@/components/dashboard/dirty-form";
import { FontPicker } from "@/components/dashboard/font-picker";
import { isHex, readableOn } from "@/lib/contrast";
import { updateVenueThemeAction } from "@/app/dashboard/venue/actions";
import type { VenueTheme } from "@/types";

// The guest site uses the primary color for link text and nudges it until it reads on the page
// (see theme-provider.tsx). Same surfaces and direction as there.
function linkAdjustment(primary: string): string | null {
  if (!isHex(primary)) return null;
  const light = readableOn(primary, ["#F5F0E8", "#FFFFFF"], "darker");
  if (light.toLowerCase() !== primary.toLowerCase()) {
    return "Guests will see a slightly darker link color so text stays readable.";
  }
  const dark = readableOn(primary, ["#1C1A17", "#252220"], "lighter");
  if (dark.toLowerCase() !== primary.toLowerCase()) {
    return "In dark mode guests will see a slightly lighter link color so text stays readable.";
  }
  return null;
}

function PrimaryColorField({ defaultValue }: { defaultValue: string }) {
  const { values } = useDirtyForm();
  const notice = linkAdjustment(values.primary_color ?? defaultValue);
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor="primary_color" name="primary_color">
        Primary color
      </FieldLabel>
      <ColorPicker id="primary_color" name="primary_color" defaultValue={defaultValue} />
      {notice && <p className="text-muted-foreground text-xs">{notice}</p>}
    </div>
  );
}

export function VenueThemeForm({
  venueId,
  venueName,
  theme,
}: {
  venueId: string;
  venueName: string;
  theme: Pick<
    VenueTheme,
    | "primary_color"
    | "secondary_color"
    | "accent_color"
    | "font_family"
    | "heading_font_family"
    | "border_radius"
  > | null;
}) {
  return (
    <DirtyForm formKey="branding" action={updateVenueThemeAction}>
      <input type="hidden" name="venueId" value={venueId} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
            <CardDescription>Your brand colors across the guest site.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <PrimaryColorField defaultValue={theme?.primary_color ?? "#1a1a2e"} />
            <div className="space-y-2">
              <FieldLabel htmlFor="secondary_color" name="secondary_color">
                Secondary color
              </FieldLabel>
              <ColorPicker
                id="secondary_color"
                name="secondary_color"
                defaultValue={theme?.secondary_color ?? "#16213e"}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="accent_color" name="accent_color">
                Accent color
              </FieldLabel>
              <ColorPicker
                id="accent_color"
                name="accent_color"
                defaultValue={theme?.accent_color ?? "#e94560"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fonts and shape</CardTitle>
            <CardDescription>How text and corners look to guests.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <FieldLabel htmlFor="heading_font_family" name="heading_font_family">
                Heading font
              </FieldLabel>
              <FontPicker
                id="heading_font_family"
                name="heading_font_family"
                defaultValue={theme?.heading_font_family ?? "Nunito Sans"}
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
                defaultValue={theme?.font_family ?? "Source Sans 3"}
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
                defaultValue={theme?.border_radius ?? "0.625rem"}
                placeholder="0.625rem"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DirtyForm>
  );
}
