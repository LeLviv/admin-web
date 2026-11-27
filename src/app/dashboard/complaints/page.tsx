"use client";

import * as React from "react";
import Image from "next/image";
import { ExternalLink, Eye, MapPin } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { ComplaintDto, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export default function ComplaintsPage() {
  const { notify } = useToast();
  const [complaints, setComplaints] = React.useState<ComplaintDto[]>([]);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [selected, setSelected] = React.useState<ComplaintDto | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  const loadComplaints = React.useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const data = await apiFetch<PageResponse<ComplaintDto>>(
          `api/v1/complaints?page=${targetPage}&size=20`
        );
        setComplaints(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPage(data.number);
      } catch (err) {
        notify({
          title: "Failed to load complaints",
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
    apiFetch<PageResponse<ComplaintDto>>("api/v1/complaints?page=0&size=20")
      .then((data) => {
        if (!active) return;
        setComplaints(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPage(data.number);
      })
      .catch((err) => {
        if (active) {
          notify({
            title: "Failed to load complaints",
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

  async function openDetail(id: number) {
    setDetailLoading(true);
    try {
      const detail = await apiFetch<ComplaintDto>(`api/v1/complaints/${id}`);
      setSelected(detail);
    } catch (err) {
      notify({
        title: "Failed to load complaint details",
        description: err instanceof ApiError ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Complaints"
        description={`Review citizen reports sorted by newest first (${totalElements} total).`}
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-text-muted">
          Loading complaints...
        </p>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-text-muted">
            No complaints submitted yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="font-mono">#{c.id}</span>
                    <span>·</span>
                    <span className="font-medium text-text">{c.author}</span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-text">{c.problem}</p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={detailLoading}
                  onClick={() => void openDetail(c.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </Button>
              </div>
            ))}
          </div>
        </Card>
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
              onClick={() => void loadComplaints(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => void loadComplaints(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          title={selected ? `Complaint #${selected.id}` : "Complaint"}
          description={
            selected
              ? `Submitted by ${selected.author} on ${new Date(selected.createdAt).toLocaleString()}`
              : undefined
          }
        >
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-text-muted">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-text">
                  {selected.problem}
                </p>
              </div>

              {selected.latitude !== null && selected.longitude !== null ? (
                <div>
                  <p className="text-xs font-medium text-text-muted">
                    Coordinates
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=16/${selected.latitude}/${selected.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-info hover:underline"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {selected.latitude.toFixed(5)},{" "}
                      {selected.longitude.toFixed(5)}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : null}

              {selected.photoPath ? (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-text-muted">
                    Attachment
                  </p>
                  <Image
                    src={selected.photoPath}
                    alt={`Complaint ${selected.id}`}
                    width={640}
                    height={360}
                    unoptimized
                    className="max-h-72 w-full rounded-md border border-border object-contain bg-surface-muted"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
