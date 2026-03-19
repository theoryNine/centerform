import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  // TODO: Fetch event data from Supabase by eventId

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Settings</h1>
          <p className="text-muted-foreground">
            Manage your standalone event.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/dashboard/events/${eventId}/schedule`}>Manage Schedule</a>
          </Button>
          <Button variant="outline">Preview</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Event editing form will be connected to Supabase. Event ID: <Badge variant="outline">{eventId}</Badge>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
