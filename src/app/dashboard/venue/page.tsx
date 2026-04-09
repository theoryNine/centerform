import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

export default async function VenueSettingsPage() {
  const supabase = await createClient();

  // TODO: scope to the authenticated user's venue
  const { data: venue } = await supabase
    .from("venues")
    .select("*, venue_themes(*)")
    .limit(1)
    .single();

  const theme = venue?.venue_themes;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Venue Settings</h1>
        <p className="text-muted-foreground">
          Manage your venue details and branding.
        </p>
      </div>

      {/* General info */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic details about your venue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input id="name" defaultValue={venue?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" defaultValue={venue?.slug ?? ""} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" defaultValue={venue?.description ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue={venue?.address ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue={venue?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={venue?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={venue?.email ?? ""} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Branding / Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Branding & Theme</CardTitle>
          <CardDescription>
            Customize how your concierge looks for guests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2">
                <Input id="primary" type="color" defaultValue={theme?.primary_color ?? "#1a1a2e"} className="h-10 w-14 p-1" />
                <Input defaultValue={theme?.primary_color ?? "#1a1a2e"} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary">Secondary Color</Label>
              <div className="flex gap-2">
                <Input id="secondary" type="color" defaultValue={theme?.secondary_color ?? "#16213e"} className="h-10 w-14 p-1" />
                <Input defaultValue={theme?.secondary_color ?? "#16213e"} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2">
                <Input id="accent" type="color" defaultValue={theme?.accent_color ?? "#e94560"} className="h-10 w-14 p-1" />
                <Input defaultValue={theme?.accent_color ?? "#e94560"} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" defaultValue={venue?.logo_url ?? ""} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font">Font Family</Label>
              <Input id="font" defaultValue={theme?.font_family ?? "Source Sans 3"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius">Border Radius</Label>
              <Input id="radius" defaultValue={theme?.border_radius ?? "0.625rem"} />
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
