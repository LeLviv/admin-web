import * as React from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-muted border-border",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
};

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
