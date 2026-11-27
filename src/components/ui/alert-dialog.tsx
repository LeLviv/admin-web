"use client";

import * as React from "react";
import { AlertDialog as RadixAlertDialog } from "radix-ui";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <RadixAlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 shadow-lg focus:outline-none">
          <RadixAlertDialog.Title className="text-base font-semibold text-text">
            {title}
          </RadixAlertDialog.Title>
          <RadixAlertDialog.Description className="mt-2 text-sm text-text-muted">
            {description}
          </RadixAlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <RadixAlertDialog.Cancel asChild>
              <Button variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </RadixAlertDialog.Cancel>
            <RadixAlertDialog.Action asChild>
              <Button
                variant={confirmVariant}
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  void onConfirm();
                }}
              >
                {loading ? "Working..." : confirmLabel}
              </Button>
            </RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
