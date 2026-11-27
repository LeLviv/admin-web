"use client";

import * as React from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { X } from "lucide-react";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
      <RadixDialog.Content
        className={`fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-lg focus:outline-none ${className}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <RadixDialog.Title className="text-base font-semibold text-text">
              {title}
            </RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="mt-1 text-xs text-text-muted">
                {description}
              </RadixDialog.Description>
            ) : null}
          </div>
          <RadixDialog.Close
            className="rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
