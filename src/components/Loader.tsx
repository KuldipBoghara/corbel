"use client";

import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { Spinner } from "./Feedback.js";

export interface LoaderProps {
  /** Text next to the spinner. Pass `null` to show only the spinner (screen readers still hear "Loading"). @default "Loading…" */
  label?: ReactNode;
  className?: string;
}

function LoaderLabel({ label, className }: { label: ReactNode; className: string }) {
  return label ? (
    <span className={className}>{label}</span>
  ) : (
    <span className="sr-only">Loading</span>
  );
}

/** Centred spinner that fills the content area while a page loads. */
export function PageLoader({ label = "Loading…", className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Spinner size={28} />
      <LoaderLabel label={label} className="text-sm font-medium text-text-secondary" />
    </div>
  );
}

/** Spinner with a label, for a section or list that is loading. */
export function InlineLoader({ label = "Loading…", className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-2 py-12", className)}
    >
      <Spinner size={18} />
      <LoaderLabel label={label} className="text-sm text-text-secondary" />
    </div>
  );
}

export interface LoadingDotsProps {
  /** Pixel size. @default 24 */
  size?: number;
  /** Colour comes from `currentColor`, so set it with a text class. */
  className?: string;
  /** Accessible label. Omit when the dots sit next to visible text. */
  label?: string;
}

/** Three pulsing dots, for "typing…" or inside buttons. Inherits the text colour. */
export function LoadingDots({ size = 24, className, label }: LoadingDotsProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("shrink-0", className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {[4, 12, 20].map((cx) => {
        const values = cx === 12 ? "3;1.5;3" : "1.5;3;1.5";
        return (
          <circle key={cx} cx={cx} cy="12" r={cx === 12 ? 3 : 1.5}>
            <animate attributeName="r" dur="0.75s" values={values} repeatCount="indefinite" />
          </circle>
        );
      })}
    </svg>
  );
}
