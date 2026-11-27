"use client";

import * as React from "react";
import { BellRing, RefreshCw } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-client";
import {
  ALERT_STATUSES,
  ALERT_TYPES,
  type AlertStatus,
  type AlertType,
} from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export default function AirRaidPage() {
  const { notify } = useToast();
  const [currentAirStatus, setCurrentAirStatus] = React.useState<string>("—");
  const [loadingStatus, setLoadingStatus] = React.useState(true);

  const [alertType, setAlertType] = React.useState<AlertType>("AIR");
  const [alertStatus, setAlertStatus] = React.useState<AlertStatus>("NONE");
  const [saving, setSaving] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [confirmNotifyOpen, setConfirmNotifyOpen] = React.useState(false);
  const [sendingNotify, setSendingNotify] = React.useState(false);

  const loadStatus = React.useCallback(async () => {
    setLoadingStatus(true);
    try {
      const status = await apiFetch<string>("api/v1/air-raid");
      setCurrentAirStatus(status);
    } catch (err) {
      notify({
        title: "Failed to fetch air raid status",
        description: err instanceof ApiError ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setLoadingStatus(false);
    }
  }, [notify]);

  React.useEffect(() => {
    let active = true;
    apiFetch<string>("api/v1/air-raid")
      .then((status) => {
        if (active) setCurrentAirStatus(status);
      })
      .catch((err) => {
        if (active) {
          notify({
            title: "Failed to fetch air raid status",
            description: err instanceof ApiError ? err.message : undefined,
            tone: "error",
          });
        }
      })
      .finally(() => {
        if (active) setLoadingStatus(false);
      });
    return () => {
      active = false;
    };
  }, [notify]);

  async function handleSetStatus(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const params = new URLSearchParams({
        type: alertType,
        status: alertStatus,
      });
      await apiFetch<void>(`api/admin/air-raid/set?${params.toString()}`, {
        method: "POST",
      });
      notify({
        title: "Alert status updated",
        description: `${alertType} set to ${alertStatus}`,
        tone: "success",
      });
      await loadStatus();
    } catch (err) {
      notify({
        title: "Failed to update status",
        description: err instanceof ApiError ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSyncOfficial() {
    setSyncing(true);
    try {
      await apiFetch<void>("api/admin/air-raid/update-official", {
        method: "POST",
      });
      notify({ title: "Synced with official alert feed", tone: "success" });
      await loadStatus();
    } catch (err) {
      notify({
        title: "Official sync failed",
        description: err instanceof ApiError ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleSendNotification() {
    setSendingNotify(true);
    try {
      await apiFetch<void>("api/admin/air-raid/send-notification", {
        method: "POST",
      });
      notify({ title: "Push notification dispatched", tone: "success" });
      setConfirmNotifyOpen(false);
    } catch (err) {
      notify({
        title: "Failed to send notification",
        description: err instanceof ApiError ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setSendingNotify(false);
    }
  }

  function statusTone(status: string) {
    if (status === "RED") return "danger" as const;
    if (status === "YELLOW") return "warning" as const;
    if (status === "NONE") return "success" as const;
    return "neutral" as const;
  }

  return (
    <div>
      <PageHeader
        title="Air Raid"
        description="Inspect current alert state, apply manual overrides, or sync with the official feed."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadStatus()}
            disabled={loadingStatus}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Status (AIR)</CardTitle>
            <CardDescription>
              Read from GET /api/v1/air-raid. Other alert types are write-only
              in the current backend API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-border bg-surface-muted/50 px-4 py-3">
              <span className="text-sm font-medium text-text">AIR</span>
              <Badge tone={statusTone(currentAirStatus)}>
                {loadingStatus ? "Loading..." : currentAirStatus}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={handleSyncOfficial}
                disabled={syncing}
              >
                <RefreshCw className="h-4 w-4" />
                <span>{syncing ? "Syncing..." : "Sync Official API"}</span>
              </Button>

              <Button
                variant="danger"
                onClick={() => setConfirmNotifyOpen(true)}
              >
                <BellRing className="h-4 w-4" />
                <span>Send Notification</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Override</CardTitle>
            <CardDescription>
              Set an alert level for a specific alert type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetStatus} className="space-y-4">
              <div>
                <Label>Alert Type</Label>
                <SelectField
                  value={alertType}
                  onValueChange={(v) => setAlertType(v as AlertType)}
                  options={ALERT_TYPES.map((t) => ({ value: t, label: t }))}
                />
              </div>

              <div>
                <Label>Alert Status</Label>
                <SelectField
                  value={alertStatus}
                  onValueChange={(v) => setAlertStatus(v as AlertStatus)}
                  options={ALERT_STATUSES.map((s) => ({ value: s, label: s }))}
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Applying..." : "Apply Status"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmNotifyOpen}
        onOpenChange={setConfirmNotifyOpen}
        title="Send air raid notification?"
        description={`This will broadcast a push notification for the current AIR status (${currentAirStatus}) to subscribed users.`}
        confirmLabel="Send Notification"
        loading={sendingNotify}
        onConfirm={handleSendNotification}
      />
    </div>
  );
}
