import * as React from "react";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`block text-xs font-medium text-text mb-1.5 ${className}`}
    {...props}
  />
));
Label.displayName = "Label";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[84px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";
