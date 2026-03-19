import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const placeholderServices = [
  { name: "Room Service", category: "room_service", description: "24/7 in-room dining available" },
  { name: "Spa & Wellness", category: "spa", description: "Massages, facials, and wellness treatments" },
  { name: "Concierge", category: "concierge", description: "Tour bookings, reservations, and recommendations" },
  { name: "Airport Transfer", category: "transportation", description: "Private car service to and from the airport" },
  { name: "Fitness Center", category: "activities", description: "Open 24 hours with modern equipment" },
  { name: "Laundry", category: "other", description: "Same-day laundry and dry cleaning service" },
];

export default function ServicesPage() {
  return (
    <div className="py-6">
      <h1 className="text-xl font-bold">Services</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything you need during your stay.
      </p>

      <div className="mt-4 space-y-3">
        {placeholderServices.map((service) => (
          <Card key={service.name}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                {service.category.replace("_", " ")}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
