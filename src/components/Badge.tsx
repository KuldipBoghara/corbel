"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn.js";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  tone?: BadgeTone;
  /** @default "md" */
  size?: BadgeSize;
  /** Small dot before the label. */
  dot?: boolean;
}

const TONES: Record<BadgeTone, string> = {
  neutral: "border-border-default bg-bg-main text-text-secondary",
  primary: "border-primary-200 bg-primary-50 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  error: "border-error/30 bg-error/10 text-error",
  info: "border-info/30 bg-info/10 text-info",
};

const SIZES: Record<BadgeSize, string> = {
  sm: "gap-1 px-2 py-px text-[10px]",
  md: "gap-1.5 px-2.5 py-0.5 text-[11px]",
  lg: "gap-1.5 px-3 py-1 text-xs",
};

/**
 * Small pill label.
 *
 * ```tsx
 * <Badge tone="success" dot>Online</Badge>
 * ```
 */
export function Badge({
  tone = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold whitespace-nowrap",
        TONES[tone],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

const DEFAULT_STATUS_TONES: Record<string, BadgeTone> = {
  ACTIVE: "success",
  APPROVED: "success",
  COMPLETED: "success",
  DONE: "success",
  PAID: "success",
  ALLOW: "success",
  PENDING: "warning",
  ON_HOLD: "warning",
  EXPIRED: "warning",
  IN_PROGRESS: "info",
  PROCESSING: "info",
  OPEN: "primary",
  INACTIVE: "neutral",
  DRAFT: "neutral",
  CLOSED: "neutral",
  REJECTED: "error",
  SUSPENDED: "error",
  CANCELLED: "error",
  FAILED: "error",
  DENY: "error",
};

/** "in-progress" / "In progress" → "IN_PROGRESS". */
const normalize = (status: string) => status.trim().toUpperCase().replace(/[\s-]+/g, "_");

/** "IN_PROGRESS" → "In progress". */
const defaultFormat = (status: string) => {
  const words = status.trim().replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export interface StatusBadgeProps extends Omit<BadgeProps, "tone"> {
  /** Status string, e.g. `"ACTIVE"`. Matched case-insensitively; `_`, `-` and spaces are equivalent. */
  status: string;
  /** Extra or overriding status → tone entries, merged over the defaults. */
  tones?: Record<string, BadgeTone>;
  /** Forces a tone, ignoring the mapping. */
  tone?: BadgeTone;
  /** Turns the status into the label. Ignored when `children` is given. */
  formatLabel?: (status: string) => ReactNode;
}

/**
 * Badge whose tone is picked from the status, so a status means one colour everywhere.
 *
 * ```tsx
 * <StatusBadge status={order.status} tones={{ SHIPPED: "info" }} dot />
 * ```
 */
export function StatusBadge({
  status,
  tones,
  tone,
  formatLabel = defaultFormat,
  children,
  ...props
}: StatusBadgeProps) {
  const key = normalize(status);
  const custom = tones
    ? Object.fromEntries(Object.entries(tones).map(([k, v]) => [normalize(k), v]))
    : undefined;
  const resolved = tone ?? custom?.[key] ?? DEFAULT_STATUS_TONES[key] ?? "neutral";
  return (
    <Badge tone={resolved} {...props}>
      {children ?? formatLabel(status)}
    </Badge>
  );
}
