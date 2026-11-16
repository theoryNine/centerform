"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DirtyForm, FieldLabel, useDirtyForm } from "@/components/dashboard/dirty-form";
import {
  DEFAULT_PHONE_LABEL,
  DEFAULT_WELCOME_BODY,
  GuestPreview,
} from "@/components/dashboard/guest-preview";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { updateVenueAction } from "@/app/dashboard/venue/actions";
import type { Venue } from "@/types";

function Field({
  name,
  label,
  className,
  children,
}: {
  name: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <FieldLabel htmlFor={name} name={name}>
        {label}
      </FieldLabel>
      {children}
    </div>
  );
}

function WelcomeCard({ venue }: { venue: Venue }) {
  const { values } = useDirtyForm();
  // Until the form has mounted `values` is empty; fall back to the saved phone.
  const hasPhone = (values.phone ?? venue.phone ?? "").trim() !== "";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome card</CardTitle>
        <CardDescription>
          The greeting guests see first. Blank fields use the defaults.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field name="welcome_heading" label="Heading">
          <Input
            id="welcome_heading"
            name="welcome_heading"
            defaultValue={venue.welcome_heading ?? ""}
            placeholder="Welcome."
          />
        </Field>
        <Field name="phone_label" label="Button label">
          {/* readOnly rather than disabled: a disabled field isn't submitted, which would wipe the
              saved label when the phone number is cleared. */}
          <Input
            id="phone_label"
            name="phone_label"
            defaultValue={venue.phone_label ?? ""}
            placeholder={DEFAULT_PHONE_LABEL}
            readOnly={!hasPhone}
            aria-disabled={!hasPhone}
            aria-describedby={hasPhone ? undefined : "phone_label_hint"}
            className={hasPhone ? undefined : "pointer-events-none opacity-50"}
            tabIndex={hasPhone ? undefined : -1}
          />
          {!hasPhone && (
            <p id="phone_label_hint" className="text-muted-foreground text-xs">
              Add a phone number first.
            </p>
          )}
        </Field>
        <Field name="welcome_body" label="Message" className="md:col-span-2">
          <Textarea
            id="welcome_body"
            name="welcome_body"
            rows={4}
            defaultValue={venue.welcome_body ?? ""}
            placeholder={DEFAULT_WELCOME_BODY}
            aria-describedby="welcome_body_hint"
          />
          <p id="welcome_body_hint" className="text-muted-foreground text-xs">
            Shown under the venue name on tablets and laptops, and in a card on phones.
          </p>
        </Field>
      </CardContent>
    </Card>
  );
}

export function VenueGeneralForm({ venue }: { venue: Venue }) {
  return (
    <DirtyForm formKey="general" action={updateVenueAction}>
      <input type="hidden" name="venueId" value={venue.id} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue</CardTitle>
              <CardDescription>The basics guests see across the site.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field name="name" label="Venue name (required)">
                <Input id="name" name="name" defaultValue={venue.name} required />
              </Field>
              <Field name="website" label="Website">
                <Input
                  id="website"
                  name="website"
                  defaultValue={venue.website ?? ""}
                  placeholder="https://..."
                />
              </Field>
              <Field name="description" label="Description" className="md:col-span-2">
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={venue.description ?? ""}
                  rows={3}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location and contact</CardTitle>
              <CardDescription>Where you are and how guests reach you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field name="address" label="Address" className="md:col-span-2">
                <Input id="address" name="address" defaultValue={venue.address ?? ""} />
              </Field>
              <Field name="city" label="City">
                <Input id="city" name="city" defaultValue={venue.city ?? ""} />
              </Field>
              <Field name="state" label="State">
                <Input id="state" name="state" defaultValue={venue.state ?? ""} />
              </Field>
              <Field name="phone" label="Phone">
                <Input id="phone" name="phone" type="tel" defaultValue={venue.phone ?? ""} />
              </Field>
              <Field name="email" label="Email">
                <Input id="email" name="email" type="email" defaultValue={venue.email ?? ""} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover image</CardTitle>
              <CardDescription>
                Used as the splash screen image and page hero for guests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                name="cover_image_url"
                defaultValue={venue.cover_image_url}
                venueId={venue.id}
                label="cover image"
              />
            </CardContent>
          </Card>

          <WelcomeCard venue={venue} />
        </div>

        <div className="sticky top-6 hidden lg:block">
          <GuestPreview venueName={venue.name} />
        </div>
      </div>
    </DirtyForm>
  );
}
