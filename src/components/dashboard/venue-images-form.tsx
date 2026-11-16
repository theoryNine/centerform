"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DirtyForm, FieldLabel } from "@/components/dashboard/dirty-form";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { updatePageImagesAction } from "@/app/dashboard/venue/actions";

const PAGES = [
  { key: "services", label: "Services", blurb: "Top of the Services page" },
  { key: "dining", label: "Dining & Drinks", blurb: "Top of the Dining page" },
  { key: "events", label: "Events", blurb: "Top of the Events page" },
  { key: "explore", label: "Explore", blurb: "Top of the Explore page" },
] as const;

export function VenueImagesForm({
  venueId,
  images,
  coverImageUrl,
}: {
  venueId: string;
  images: Record<string, string | null>;
  /** The venue's saved cover image: what a page shows until it has an image of its own. */
  coverImageUrl: string | null;
}) {
  return (
    <DirtyForm formKey="images" action={updatePageImagesAction}>
      <input type="hidden" name="venueId" value={venueId} />
      <p className="text-muted-foreground mb-4 text-sm">
        Each page can have its own hero image. Until it does, guests see your cover image.
      </p>
      <Card className="py-0">
        <CardContent className="p-0">
          <ul className="divide-y">
            {PAGES.map((p) => (
              <li
                key={p.key}
                className="grid gap-3 p-4 md:grid-cols-[200px_minmax(0,1fr)] md:items-center"
              >
                <div>
                  <FieldLabel name={p.key} className="text-sm font-semibold">
                    {p.label}
                  </FieldLabel>
                  <p className="text-muted-foreground text-xs">{p.blurb}</p>
                </div>
                <ImageUpload
                  name={p.key}
                  defaultValue={images[p.key]}
                  venueId={venueId}
                  compact
                  label={`${p.label} page image`}
                  fallbackUrl={coverImageUrl}
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DirtyForm>
  );
}
