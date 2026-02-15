import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function VenueSettingsPage() {
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
              <Input id="name" defaultValue="The Grand Hotel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" defaultValue="the-grand-hotel" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" defaultValue="A boutique hotel in the heart of the city." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Main Street" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue="San Francisco" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="hello@thegrandhotel.com" />
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
                <Input id="primary" type="color" defaultValue="#1a1a2e" className="h-10 w-14 p-1" />
                <Input defaultValue="#1a1a2e" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary">Secondary Color</Label>
              <div className="flex gap-2">
                <Input id="secondary" type="color" defaultValue="#16213e" className="h-10 w-14 p-1" />
                <Input defaultValue="#16213e" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2">
                <Input id="accent" type="color" defaultValue="#e94560" className="h-10 w-14 p-1" />
                <Input defaultValue="#e94560" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font">Font Family</Label>
              <Input id="font" defaultValue="Inter" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius">Border Radius</Label>
              <Input id="radius" defaultValue="0.625rem" />
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
