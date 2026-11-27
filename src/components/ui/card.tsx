import * as React from "react";

export function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface ${className}`}
      {...props}
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col gap-1 border-b border-border px-5 py-4 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-sm font-semibold tracking-tight text-text ${className}`}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-text-muted ${className}`} {...props} />
  );
}

export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 ${className}`} {...props} />;
}
