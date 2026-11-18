"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../utils/cn.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "primary" */
  variant?: ButtonVariant;
  /** @default "md" */
  size?: ButtonSize;
  /** Shows a spinner in place of `startIcon` and disables the button. */
  loading?: boolean;
  /** Stretches to the full width of its container. */
  fullWidth?: boolean;
  /** Icon before the label. */
  startIcon?: ReactNode;
  /** Icon after the label. */
  endIcon?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-contrast shadow-sm hover:bg-primary-dark",
  secondary: "border border-primary-100 bg-primary-50 text-primary hover:bg-primary-100",
  outline: "border border-border-default bg-bg-card text-text-primary hover:bg-bg-main",
  ghost: "text-text-secondary hover:bg-bg-main hover:text-text-primary",
  danger: "bg-error text-white shadow-sm hover:bg-error/90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
};

/**
 * ```tsx
 * <Button variant="outline" startIcon={<Plus size={16} />} onClick={add}>Add</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        startIcon && <span className="flex shrink-0 items-center">{startIcon}</span>
      )}
      {children}
      {!loading && endIcon && <span className="flex shrink-0 items-center">{endIcon}</span>}
    </button>
  );
});
