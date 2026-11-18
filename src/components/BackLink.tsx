"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "../utils/cn.js";

export type BackLinkSize = "sm" | "md" | "lg";

export interface BackLinkProps {
  /** @default "Back" */
  label?: ReactNode;
  /** Renders an `<a>` to this URL. */
  href?: string;
  /**
   * Renders a `<button>`. With neither `href` nor `onClick`, the button calls
   * `window.history.back()`. For React Router: `onClick={() => navigate(-1)}`.
   */
  onClick?: () => void;
  /** @default "md" */
  size?: BackLinkSize;
  className?: string;
}

const SIZES: Record<BackLinkSize, { text: string; icon: number }> = {
  sm: { text: "gap-0.5 text-xs", icon: 14 },
  md: { text: "gap-1 text-sm", icon: 16 },
  lg: { text: "gap-1.5 text-base", icon: 20 },
};

/**
 * "‹ Back" link above a page title.
 *
 * ```tsx
 * <BackLink href="/orders" label="All orders" />
 * <BackLink onClick={() => navigate(-1)} />
 * ```
 */
export function BackLink({ label = "Back", href, onClick, size = "md", className }: BackLinkProps) {
  const classes = cn(
    "inline-flex max-w-max min-w-0 cursor-pointer items-center rounded-sm font-semibold text-text-secondary transition-colors hover:text-primary",
    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none",
    SIZES[size].text,
    className,
  );
  const content = (
    <>
      <ChevronLeft size={SIZES[size].icon} className="shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick ?? (() => window.history.back())} className={classes}>
      {content}
    </button>
  );
}
