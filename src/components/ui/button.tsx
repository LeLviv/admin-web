import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover border border-transparent",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface-muted",
  ghost:
    "bg-transparent text-text-muted hover:text-text hover:bg-surface-muted border border-transparent",
  danger:
    "bg-danger text-white hover:opacity-90 border border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
