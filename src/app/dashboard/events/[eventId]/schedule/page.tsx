import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const placeholderSchedule = [
  { title: "Registration & Welcome Coffee", location: "Main Lobby", time: "8:00 AM", featured: false, active: true },
  { title: "Opening Keynote", location: "Grand Ballroom", time: "9:00 AM", featured: true, active: true },
  { title: "Workshop: Getting Started", location: "Room 201", time: "11:00 AM", featured: false, active: true },
  { title: "Networking Lunch", location: "Terrace", time: "12:30 PM", featured: false, active: true },
  { title: "Panel Discussion", location: "Grand Ballroom", time: "2:00 PM", featured: true, active: true },
  { title: "Closing Ceremony", location: "Grand Ballroom", time: "4:00 PM", featured: true, active: false },
];

export default async function ManageSchedulePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await params;

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
            {placeholderSchedule.map((item) => (
              <div key={item.title} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.location} &middot; {item.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.active ? "default" : "secondary"}>
                    {item.active ? "Active" : "Draft"}
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
