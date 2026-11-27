"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  MessageSquareWarning,
  Puzzle,
  Siren,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type {
  ComplaintDto,
  EventResponse,
  PageResponse,
  SurveyResponseDto,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function DashboardOverviewPage() {
  const [eventsCount, setEventsCount] = React.useState<number | null>(null);
  const [surveysCount, setSurveysCount] = React.useState<number | null>(null);
  const [complaintsCount, setComplaintsCount] = React.useState<number | null>(
    null
  );
  const [airRaidStatus, setAirRaidStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      const [eventsRes, surveysRes, complaintsRes, airRes] =
        await Promise.allSettled([
          apiFetch<PageResponse<EventResponse>>("api/v1/events?page=0&size=1"),
          apiFetch<PageResponse<SurveyResponseDto>>(
            "api/v1/surveys?page=0&size=1"
          ),
          apiFetch<PageResponse<ComplaintDto>>(
            "api/v1/complaints?page=0&size=1"
          ),
          apiFetch<string>("api/v1/air-raid"),
        ]);

      if (!active) return;

      if (eventsRes.status === "fulfilled") {
        setEventsCount(eventsRes.value.totalElements);
      }
      if (surveysRes.status === "fulfilled") {
        setSurveysCount(surveysRes.value.totalElements);
      }
      if (complaintsRes.status === "fulfilled") {
        setComplaintsCount(complaintsRes.value.totalElements);
      }
      if (airRes.status === "fulfilled") {
        setAirRaidStatus(airRes.value);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  function alertTone(status: string | null) {
    if (status === "RED") return "danger" as const;
    if (status === "YELLOW") return "warning" as const;
    if (status === "NONE") return "success" as const;
    return "neutral" as const;
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Quick summary across active LeLviv administration modules."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/events" className="group">
          <Card className="transition-colors group-hover:border-border-strong">
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">Events</p>
                <p className="mt-1 text-2xl font-semibold">
                  {eventsCount ?? "—"}
                </p>
              </div>
              <CalendarDays className="h-4 w-4 text-text-muted" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/surveys" className="group">
          <Card className="transition-colors group-hover:border-border-strong">
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">Surveys</p>
                <p className="mt-1 text-2xl font-semibold">
                  {surveysCount ?? "—"}
                </p>
              </div>
              <ClipboardList className="h-4 w-4 text-text-muted" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/complaints" className="group">
          <Card className="transition-colors group-hover:border-border-strong">
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">Complaints</p>
                <p className="mt-1 text-2xl font-semibold">
                  {complaintsCount ?? "—"}
                </p>
              </div>
              <MessageSquareWarning className="h-4 w-4 text-text-muted" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/air-raid" className="group">
          <Card className="transition-colors group-hover:border-border-strong">
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">Air Raid (AIR)</p>
                <div className="mt-2">
                  <Badge tone={alertTone(airRaidStatus)}>
                    {airRaidStatus ?? "—"}
                  </Badge>
                </div>
              </div>
              <Siren className="h-4 w-4 text-text-muted" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-text-muted" />
              <CardTitle>Extensible Workspace</CardTitle>
            </div>
            <Link
              href="/dashboard/modules"
              className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text"
            >
              <span>Open modules</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CardDescription>
            Reserved space for future administrative features and integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-dashed border-border p-4">
              <p className="text-xs font-medium text-text">Moderation Queue</p>
              <p className="mt-1 text-xs text-text-muted">
                Slot reserved for user & content moderation tools.
              </p>
            </div>
            <div className="rounded-md border border-dashed border-border p-4">
              <p className="text-xs font-medium text-text">
                Push Broadcasts
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Slot reserved for custom Firebase announcements.
              </p>
            </div>
            <div className="rounded-md border border-dashed border-border p-4">
              <p className="text-xs font-medium text-text">System & Weather</p>
              <p className="mt-1 text-xs text-text-muted">
                Slot reserved for cache controls and diagnostics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
