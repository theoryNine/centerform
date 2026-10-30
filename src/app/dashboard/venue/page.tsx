import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDashboardVenue } from "@/lib/dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { updateVenueAction, updateVenueThemeAction, updatePageImagesAction } from "./actions";
import { ColorPicker } from "@/components/dashboard/color-picker";
import { FontPicker } from "@/components/dashboard/font-picker";
import { ImageUpload } from "@/components/dashboard/image-upload";

export default async function VenueSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const active = await getActiveDashboardVenue(session.user.id);
  if (!active) redirect("/sign-in");

  const supabase = createAdminClient();
  const [{ data: theme }, { data: pageDescRows }] = await Promise.all([
    supabase.from("venue_themes").select("*").eq("venue_id", active.venue.id).maybeSingle(),
    supabase
      .from("venue_page_descriptions")
      .select("page_slug, image_url")
      .eq("venue_id", active.venue.id)
      .in("page_slug", ["services", "dining", "events", "explore"]),
  ]);

  const pageImages = Object.fromEntries(
    (pageDescRows ?? []).map((r) => [r.page_slug, (r as { image_url: string | null }).image_url ?? null]),
  ) as Record<string, string | null>;

  const v = active.venue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hotel Info & Branding</h1>
        <p className="text-muted-foreground">Manage your venue details and branding.</p>
      </div>

      {/* General info */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic details about your venue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateVenueAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="venueId" value={v.id} />
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input id="name" name="name" defaultValue={v.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={v.website ?? ""} placeholder="https://..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={v.description ?? ""} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={v.address ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={v.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={v.state ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={v.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={v.email ?? ""} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Cover Image</Label>
              <p className="text-[11px] text-muted-foreground">
                Used as the splash screen image and page hero for guests.
              </p>
              <ImageUpload name="cover_image_url" defaultValue={v.cover_image_url} venueId={v.id} />
            </div>
            <div className="md:col-span-2">
              <Separator className="mb-4" />
              <p className="mb-3 text-sm font-medium">Welcome Card</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="welcome_heading">Heading</Label>
                  <Input
                    id="welcome_heading"
                    name="welcome_heading"
                    defaultValue={v.welcome_heading ?? ""}
                    placeholder="Welcome."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_label">Phone Label</Label>
                  <Input
                    id="phone_label"
                    name="phone_label"
                    defaultValue={v.phone_label ?? ""}
                    placeholder="Call the Front Desk"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="welcome_body">Body Text</Label>
                  <Textarea
                    id="welcome_body"
                    name="welcome_body"
                    defaultValue={v.welcome_body ?? ""}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Page Images */}
      <Card>
        <CardHeader>
          <CardTitle>Page Images</CardTitle>
          <CardDescription>
            Hero image for each section page. Falls back to the Cover Image above when not set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePageImagesAction} className="grid gap-6 md:grid-cols-2">
            <input type="hidden" name="venueId" value={v.id} />
            <div className="space-y-2">
              <Label>Services</Label>
              <ImageUpload name="services" defaultValue={pageImages["services"]} venueId={v.id} />
            </div>
            <div className="space-y-2">
              <Label>Dining &amp; Drinks</Label>
              <ImageUpload name="dining" defaultValue={pageImages["dining"]} venueId={v.id} />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <ImageUpload name="events" defaultValue={pageImages["events"]} venueId={v.id} />
            </div>
            <div className="space-y-2">
              <Label>Explore</Label>
              <ImageUpload name="explore" defaultValue={pageImages["explore"]} venueId={v.id} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save Page Images</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Branding / Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Branding &amp; Theme</CardTitle>
          <CardDescription>Customize how your concierge looks for guests.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateVenueThemeAction} className="grid gap-4 md:grid-cols-3">
            <input type="hidden" name="venueId" value={v.id} />
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <ColorPicker
                id="primary_color"
                name="primary_color"
                defaultValue={theme?.primary_color ?? "#1a1a2e"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <ColorPicker
                id="secondary_color"
                name="secondary_color"
                defaultValue={theme?.secondary_color ?? "#16213e"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent Color</Label>
              <ColorPicker
                id="accent_color"
                name="accent_color"
                defaultValue={theme?.accent_color ?? "#e94560"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heading_font_family">Heading Font</Label>
              <FontPicker
                id="heading_font_family"
                name="heading_font_family"
                defaultValue={theme?.heading_font_family ?? "Nunito Sans"}
                variant="heading"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font_family">Body Font</Label>
              <FontPicker
                id="font_family"
                name="font_family"
                defaultValue={theme?.font_family ?? "Source Sans 3"}
                variant="body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="border_radius">Border Radius</Label>
              <Input
                id="border_radius"
                name="border_radius"
                defaultValue={theme?.border_radius ?? "0.625rem"}
                placeholder="0.625rem"
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Update Theme</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
