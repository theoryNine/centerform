import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const placeholderServices = [
  { name: "Room Service", category: "room_service", active: true },
  { name: "Spa & Wellness", category: "spa", active: true },
  { name: "Concierge", category: "concierge", active: true },
  { name: "Airport Transfer", category: "transportation", active: true },
  { name: "Fitness Center", category: "activities", active: true },
  { name: "Laundry", category: "other", active: false },
];

export default function ManageServicesPage() {
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
            {placeholderServices.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.category.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={service.active ? "default" : "secondary"}>
                    {service.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
