"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceSheet } from "@/components/dashboard/service-sheet";
import type { Service } from "@/types";

interface ServicesClientProps {
  services: Service[];
  venueId: string;
}

export function ServicesClient({ services, venueId }: ServicesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(service: Service) {
    setSelected(service);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage the services available to your guests.</p>
        </div>
        <Button onClick={openCreate}>Add Service</Button>
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
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {service.category.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(service)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ServiceSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        service={selected}
        venueId={venueId}
      />
    </div>
  );
}
