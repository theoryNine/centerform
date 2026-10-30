import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllEventScheduleItems } from "@/lib/queries";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ManageSchedulePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const schedule = await getAllEventScheduleItems(eventId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Schedule</h1>
          <p className="text-muted-foreground">
            Manage sessions, talks, and activities for this event.
          </p>
        </div>
        <Button>Add Session</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {schedule.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No schedule items yet. Add your first session to get started.
              </p>
            ) : (
              schedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.is_featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.location} &middot; {formatTime(item.start_time)}
                      {item.end_time && ` – ${formatTime(item.end_time)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Draft"}
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
