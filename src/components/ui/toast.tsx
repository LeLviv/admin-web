"use client";

import * as React from "react";
import { Toast as RadixToast } from "radix-ui";
import { X } from "lucide-react";

type ToastTone = "default" | "error" | "success";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  notify: (opts: {
    title: string;
    description?: string;
    tone?: ToastTone;
  }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const notify = React.useCallback(
    ({
      title,
      description,
      tone = "default",
    }: {
      title: string;
      description?: string;
      tone?: ToastTone;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, description, tone }]);
    },
    []
  );

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            open
            onOpenChange={(open) => {
              if (!open) remove(t.id);
            }}
            className={`flex items-start justify-between gap-3 rounded-md border p-3.5 shadow-md ${
              t.tone === "error"
                ? "border-danger/30 bg-danger-soft text-danger"
                : t.tone === "success"
                  ? "border-success/30 bg-success-soft text-success"
                  : "border-border bg-surface text-text"
            }`}
          >
            <div>
              <RadixToast.Title className="text-sm font-medium">
                {t.title}
              </RadixToast.Title>
              {t.description ? (
                <RadixToast.Description className="mt-0.5 text-xs opacity-90">
                  {t.description}
                </RadixToast.Description>
              ) : null}
            </div>
            <RadixToast.Close
              aria-label="Dismiss"
              className="rounded p-0.5 opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[92vw] flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
