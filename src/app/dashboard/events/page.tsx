"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { EventRequestPayload, EventResponse, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function toLocalDateTimeString(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

export default function EventsPage() {
  const { notify } = useToast();
  const [events, setEvents] = React.useState<EventResponse[]>([]);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [searchTitle, setSearchTitle] = React.useState("");
  const [freeOnly, setFreeOnly] = React.useState(false);
  const [upcomingOnly, setUpcomingOnly] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventResponse | null>(
    null
  );
  const [saving, setSaving] = React.useState(false);

  // Form fields
  const [title, setTitle] = React.useState("");
  const [host, setHost] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [eventStart, setEventStart] = React.useState("");
  const [eventEnd, setEventEnd] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [price, setPrice] = React.useState("0");
  const [url, setUrl] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState<File | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = React.useState<EventResponse | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);

  const loadEvents = React.useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          size: "10",
          freeOnly: String(freeOnly),
          upcomingOnly: String(upcomingOnly),
        });
        if (searchTitle.trim()) {
          params.set("title", searchTitle.trim());
        }
        const data = await apiFetch<PageResponse<EventResponse>>(
          `api/v1/events?${params.toString()}`
        );
        setEvents(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPage(data.number);
      } catch (err) {
        notify({
          title: "Failed to load events",
          description: err instanceof ApiError ? err.message : undefined,
          tone: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [freeOnly, notify, searchTitle, upcomingOnly]
  );

  React.useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: "0",
      size: "10",
      freeOnly: String(freeOnly),
      upcomingOnly: String(upcomingOnly),
    });
    if (searchTitle.trim()) {
      params.set("title", searchTitle.trim());
    }
    apiFetch<PageResponse<EventResponse>>(
      `api/v1/events?${params.toString()}`
    )
      .then((data) => {
        if (!active) return;
        setEvents(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPage(data.number);
      })
      .catch((err) => {
        if (active) {
          notify({
            title: "Failed to load events",
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
  }, [freeOnly, notify, searchTitle, upcomingOnly]);

  function openCreate() {
    setEditingEvent(null);
    setTitle("");
    setHost("");
    setDescription("");
    setEventStart("");
    setEventEnd("");
    setLocation("");
    setPrice("0");
    setUrl("");
    setThumbnail(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(ev: EventResponse) {
    setEditingEvent(ev);
    setTitle(ev.title);
    setHost(ev.host);
    setDescription(ev.description || "");
    setEventStart(toLocalInput(ev.eventStart));
    setEventEnd(toLocalInput(ev.eventEnd));
    setLocation(ev.location);
    setPrice(String(ev.price));
    setUrl(ev.url || "");
    setThumbnail(null);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = Number(price);
    if (!Number.isInteger(parsedPrice) || parsedPrice < 0) {
      setFormError("Price must be a non-negative integer.");
      return;
    }

    if (eventEnd && eventStart && eventEnd < eventStart) {
      setFormError("Event end time cannot be before start time.");
      return;
    }

    const payload: EventRequestPayload = {
      title: title.trim(),
      host: host.trim(),
      description: description.trim() || undefined,
      eventStart: toLocalDateTimeString(eventStart),
      eventEnd: eventEnd ? toLocalDateTimeString(eventEnd) : null,
      location: location.trim(),
      price: parsedPrice,
      url: url.trim() || undefined,
    };

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    setSaving(true);
    try {
      if (editingEvent) {
        await apiFetch<EventResponse>(`api/admin/events/${editingEvent.id}`, {
          method: "PUT",
          body: formData,
        });
        notify({ title: "Event updated", tone: "success" });
      } else {
        await apiFetch<EventResponse>("api/admin/events", {
          method: "POST",
          body: formData,
        });
        notify({ title: "Event created", tone: "success" });
      }
      setFormOpen(false);
      await loadEvents(page);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Failed to save event."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch<void>(`api/admin/events/${deleteTarget.id}`, {
        method: "DELETE",
      });
      notify({ title: "Event deleted", tone: "success" });
      setDeleteTarget(null);
      await loadEvents(page);
    } catch (err) {
      notify({
        title: "Failed to delete event",
        description: err instanceof ApiError ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Events"
        description={`Create, update, and remove public events (${totalElements} total).`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search by title..."
              className="pl-9"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="rounded border-border"
            />
            Free only
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => setUpcomingOnly(e.target.checked)}
              className="rounded border-border"
            />
            Upcoming only
          </label>
        </CardContent>
      </Card>

      {loading ? (
        <p className="py-10 text-center text-sm text-text-muted">
          Loading events...
        </p>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-text-muted">
            No events match the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <Card key={ev.id}>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4 min-w-0">
                  {ev.thumbnailUrl ? (
                    <Image
                      src={ev.thumbnailUrl}
                      alt={ev.title}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 shrink-0 rounded-md border border-border object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-text">
                        {ev.title}
                      </h3>
                      <Badge tone={ev.price === 0 ? "success" : "neutral"}>
                        {ev.price === 0 ? "Free" : `${ev.price} UAH`}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {ev.host} · {ev.location}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {new Date(ev.eventStart).toLocaleString()}
                      {ev.eventEnd
                        ? ` — ${new Date(ev.eventEnd).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(ev)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(ev)}
                    aria-label={`Delete ${ev.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
              onClick={() => void loadEvents(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => void loadEvents(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          title={editingEvent ? "Edit Event" : "Create Event"}
          description="Fill in the event details. Thumbnail uploads are limited to 5 MB."
        >
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <Label htmlFor="ev-title">Title *</Label>
              <Input
                id="ev-title"
                required
                maxLength={256}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ev-host">Host *</Label>
                <Input
                  id="ev-host"
                  required
                  maxLength={256}
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ev-price">Price (UAH) *</Label>
                <Input
                  id="ev-price"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ev-location">Location *</Label>
              <Input
                id="ev-location"
                required
                maxLength={512}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ev-start">Start *</Label>
                <Input
                  id="ev-start"
                  type="datetime-local"
                  required
                  value={eventStart}
                  onChange={(e) => setEventStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ev-end">End</Label>
                <Input
                  id="ev-end"
                  type="datetime-local"
                  value={eventEnd}
                  onChange={(e) => setEventEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ev-url">External URL</Label>
              <Input
                id="ev-url"
                type="url"
                maxLength={512}
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea
                id="ev-desc"
                maxLength={4096}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ev-thumb">
                Thumbnail {editingEvent ? "(leave empty to keep current)" : ""}
              </Label>
              <Input
                id="ev-thumb"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
              />
            </div>

            {formError ? (
              <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingEvent
                    ? "Save changes"
                    : "Create event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete event?"
        description={`This will permanently remove "${deleteTarget?.title ?? ""}" and its thumbnail.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
