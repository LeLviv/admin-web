"use client";

import * as React from "react";
import { Ban, Clock, Plus, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-client";
import type {
  MakeSurveyRequestPayload,
  PageResponse,
  SurveyResponseDto,
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

function toLocalDateTimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SurveysPage() {
  const { notify } = useToast();
  const [surveys, setSurveys] = React.useState<SurveyResponseDto[]>([]);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Create survey modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [options, setOptions] = React.useState<string[]>(["", ""]);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  // Cancel survey confirm
  const [cancelTarget, setCancelTarget] =
    React.useState<SurveyResponseDto | null>(null);
  const [canceling, setCanceling] = React.useState(false);

  // Expiration modal
  const [expireTarget, setExpireTarget] =
    React.useState<SurveyResponseDto | null>(null);
  const [newEndTime, setNewEndTime] = React.useState("");
  const [expireError, setExpireError] = React.useState<string | null>(null);
  const [updatingExpire, setUpdatingExpire] = React.useState(false);

  const loadSurveys = React.useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const data = await apiFetch<PageResponse<SurveyResponseDto>>(
          `api/v1/surveys?page=${targetPage}&size=10`
        );
        setSurveys(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPage(data.number);
      } catch (err) {
        notify({
          title: "Failed to load surveys",
          description: err instanceof ApiError ? err.message : undefined,
          tone: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  React.useEffect(() => {
    let active = true;
    apiFetch<PageResponse<SurveyResponseDto>>("api/v1/surveys?page=0&size=10")
      .then((data) => {
        if (!active) return;
        setSurveys(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPage(data.number);
      })
      .catch((err) => {
        if (active) {
          notify({
            title: "Failed to load surveys",
            description: err instanceof ApiError ? err.message : undefined,
            tone: "error",
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [notify]);

  function openCreate() {
    setTitle("");
    setQuestion("");
    setStartTime("");
    setEndTime("");
    setOptions(["", ""]);
    setCreateError(null);
    setCreateOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      setCreateError("Provide at least 2 non-empty options.");
      return;
    }

    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();
    if (new Date(startIso) >= new Date(endIso)) {
      setCreateError("End time must be after start time.");
      return;
    }

    const payload: MakeSurveyRequestPayload = {
      title: title.trim(),
      question: question.trim(),
      startTime: startIso,
      endTime: endIso,
      options: cleanedOptions,
    };

    setCreating(true);
    try {
      await apiFetch<{ id: number }>("api/v1/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      notify({ title: "Survey created", tone: "success" });
      setCreateOpen(false);
      await loadSurveys(0);
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.message : "Failed to create survey."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleCancelSurvey() {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await apiFetch<void>(`api/v1/surveys/${cancelTarget.id}/cancel`, {
        method: "PATCH",
      });
      notify({ title: "Survey canceled", tone: "success" });
      setCancelTarget(null);
      await loadSurveys(page);
    } catch (err) {
      notify({
        title: "Failed to cancel survey",
        description: err instanceof ApiError ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setCanceling(false);
    }
  }

  function openExpireDialog(survey: SurveyResponseDto) {
    setExpireTarget(survey);
    setNewEndTime(toLocalDateTimeInput(survey.endTime));
    setExpireError(null);
  }

  async function handleUpdateExpiration(e: React.FormEvent) {
    e.preventDefault();
    if (!expireTarget) return;
    setExpireError(null);

    const newIso = new Date(newEndTime).toISOString();
    if (new Date(newIso) <= new Date(expireTarget.startTime)) {
      setExpireError("New expiration must be after the survey start time.");
      return;
    }

    setUpdatingExpire(true);
    try {
      const params = new URLSearchParams({ newTime: newIso });
      await apiFetch<void>(
        `api/v1/surveys/${expireTarget.id}/expiration?${params.toString()}`,
        { method: "PATCH" }
      );
      notify({ title: "Expiration updated", tone: "success" });
      setExpireTarget(null);
      await loadSurveys(page);
    } catch (err) {
      setExpireError(
        err instanceof ApiError ? err.message : "Failed to update expiration."
      );
    } finally {
      setUpdatingExpire(false);
    }
  }

  function statusTone(status: string) {
    if (status === "ACTIVE") return "success" as const;
    if (status === "CANCELED") return "danger" as const;
    return "neutral" as const;
  }

  return (
    <div>
      <PageHeader
        title="Surveys"
        description={`Create polls, inspect vote counts, and manage expiration (${totalElements} total).`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span>New Survey</span>
          </Button>
        }
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-text-muted">
          Loading surveys...
        </p>
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-text-muted">
            No surveys found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {surveys.map((s) => {
            const totalVotes = s.options.reduce(
              (acc, opt) => acc + (opt.votesCount ?? 0),
              0
            );
            return (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{s.title}</CardTitle>
                        <Badge tone={statusTone(s.surveyStatus)}>
                          {s.surveyStatus}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {s.question}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openExpireDialog(s)}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Expiration</span>
                      </Button>
                      {s.surveyStatus === "ACTIVE" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelTarget(s)}
                        >
                          <Ban className="h-3.5 w-3.5 text-danger" />
                          <span>Cancel</span>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {s.options.map((opt) => {
                      const pct =
                        totalVotes > 0
                          ? Math.round((opt.votesCount / totalVotes) * 100)
                          : 0;
                      return (
                        <div key={opt.position} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-text">{opt.option}</span>
                            <span className="text-text-muted">
                              {opt.votesCount} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                            <div
                              className="h-full bg-accent transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-text-muted">
                    {totalVotes} total votes ·{" "}
                    {new Date(s.startTime).toLocaleString()} →{" "}
                    {new Date(s.endTime).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between text-xs text-text-muted">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => void loadSurveys(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => void loadSurveys(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          title="Create Survey"
          description="Surveys require at least two options and a valid start/end window."
        >
          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <Label htmlFor="sv-title">Title *</Label>
              <Input
                id="sv-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="sv-question">Question *</Label>
              <Input
                id="sv-question"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="sv-start">Start Time *</Label>
                <Input
                  id="sv-start"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sv-end">End Time *</Label>
                <Input
                  id="sv-end"
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="mb-0">Options * (min 2)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOptions((prev) => [...prev, ""])}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add option</span>
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      required
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                    />
                    {options.length > 2 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setOptions((prev) => prev.filter((_, i) => i !== idx))
                        }
                        aria-label="Remove option"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {createError ? (
              <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                {createError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create survey"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(expireTarget)}
        onOpenChange={(open) => {
          if (!open) setExpireTarget(null);
        }}
      >
        <DialogContent
          title="Change Expiration"
          description={`Update end time for "${expireTarget?.title ?? ""}".`}
        >
          <form onSubmit={handleUpdateExpiration} className="space-y-4">
            <div>
              <Label htmlFor="sv-new-end">New End Time *</Label>
              <Input
                id="sv-new-end"
                type="datetime-local"
                required
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>

            {expireError ? (
              <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                {expireError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setExpireTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatingExpire}>
                {updatingExpire ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Cancel survey?"
        description={`Users will no longer be able to vote on "${cancelTarget?.title ?? ""}".`}
        confirmLabel="Cancel survey"
        loading={canceling}
        onConfirm={handleCancelSurvey}
      />
    </div>
  );
}
