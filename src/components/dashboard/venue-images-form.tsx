"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DirtyForm, FieldLabel } from "@/components/dashboard/dirty-form";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { updatePageImagesAction } from "@/app/dashboard/venue/actions";

const PAGES = [
  { key: "services", label: "Services" },
  { key: "dining", label: "Dining & Drinks" },
  { key: "events", label: "Events" },
  { key: "explore", label: "Explore" },
] as const;

export function VenueImagesForm({
  venueId,
  images,
}: {
  venueId: string;
  images: Record<string, string | null>;
}) {
  return (
    <DirtyForm formKey="images" action={updatePageImagesAction}>
      <input type="hidden" name="venueId" value={venueId} />
      <p className="text-muted-foreground mb-4 text-sm">
        Hero image for each section page. Falls back to the cover image when not set.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {PAGES.map((p) => (
          <Card key={p.key}>
            <CardHeader>
              <CardTitle>
                <FieldLabel name={p.key} className="text-base leading-none font-semibold">
                  {p.label}
                </FieldLabel>
              </CardTitle>
              <CardDescription>Shown at the top of the {p.label} page.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                name={p.key}
                defaultValue={images[p.key]}
                venueId={venueId}
                label={`${p.label} page image`}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </DirtyForm>
  );
}
