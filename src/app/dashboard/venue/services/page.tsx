import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function ManageServicesPage() {
  const supabase = await createClient();

  // TODO: scope to the authenticated user's venue
  const { data: venue } = await supabase
    .from("venues")
    .select("id")
    .limit(1)
    .single();

  const services = venue
    ? (await supabase
        .from("services")
        .select("*")
        .eq("venue_id", venue.id)
        .order("display_order", { ascending: true }))
        .data ?? []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage the services available to your guests.
          </p>
        </div>
        <Button>Add Service</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {services.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No services yet. Add your first service to get started.
              </p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.category.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
