import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLANNED_SLOTS = [
  {
    name: "User & Role Management",
    route: "/dashboard/users",
    notes: "Promote/demote admins and inspect registered accounts.",
  },
  {
    name: "Weather Cache & Diagnostics",
    route: "/dashboard/weather",
    notes: "Inspect fallback stores and provider health.",
  },
  {
    name: "Push Announcements",
    route: "/dashboard/notifications",
    notes: "Send targeted Firebase messages outside air-raid alerts.",
  },
];

export default function FutureModulesPage() {
  return (
    <div>
      <PageHeader
        title="Future Modules"
        description="Extension space for upcoming LeLviv admin capabilities."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANNED_SLOTS.map((slot) => (
          <Card key={slot.name} className="border-dashed">
            <CardHeader>
              <CardTitle>{slot.name}</CardTitle>
              <CardDescription className="font-mono text-[11px]">
                {slot.route}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-text-muted">{slot.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
