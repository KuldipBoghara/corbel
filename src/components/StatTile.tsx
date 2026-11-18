"use client";

import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import type { BadgeTone } from "./Badge.js";

export type StatTileSlot = "root" | "label" | "icon" | "value" | "hint";

export interface StatTileProps {
  /** Small capitalised caption above the figure. */
  label: ReactNode;
  /** The headline figure. */
  value: ReactNode;
  /** One line under the figure, for the secondary measure. */
  hint?: ReactNode;
  /** Tints the tile and colours the caption; the figure stays neutral so tiles compare at a glance. @default "neutral" */
  tone?: BadgeTone;
  /** Shown before the caption, in the tone colour. */
  icon?: ReactNode;
  /** Makes the whole tile a button, e.g. for tiles that double as filters. */
  onClick?: () => void;
  /** Highlights the tile (and sets `aria-pressed` when it is a button). */
  active?: boolean;
  className?: string;
  classNames?: Partial<Record<StatTileSlot, string>>;
}

const TONES: Record<BadgeTone, { shell: string; label: string }> = {
  neutral: { shell: "border-border-default bg-bg-card", label: "text-text-muted" },
  primary: { shell: "border-primary-200 bg-primary-50", label: "text-primary" },
  success: { shell: "border-success/30 bg-success/10", label: "text-success" },
  warning: { shell: "border-warning/30 bg-warning/10", label: "text-warning" },
  error: { shell: "border-error/30 bg-error/10", label: "text-error" },
  info: { shell: "border-info/30 bg-info/10", label: "text-info" },
};

/**
 * One headline figure. Use a tone on the tile the eye should land on.
 *
 * ```tsx
 * <StatTileRow>
 *   <StatTile label="Open" value={12} />
 *   <StatTile label="Overdue" value={3} tone="error" hint="2 since Monday" />
 * </StatTileRow>
 * ```
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  onClick,
  active,
  className,
  classNames,
}: StatTileProps) {
  const palette = TONES[tone];

  const body = (
    <>
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className={cn("flex shrink-0", palette.label, classNames?.icon)}>{icon}</span>
        )}
        <p
          className={cn(
            "truncate text-[10px] font-bold tracking-wide uppercase",
            palette.label,
            classNames?.label,
          )}
        >
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-1.5 text-2xl leading-tight font-black tracking-tight text-text-primary",
          classNames?.value,
        )}
      >
        {value}
      </p>
      {hint && <p className={cn("mt-1 text-[11px] text-text-secondary", classNames?.hint)}>{hint}</p>}
    </>
  );

  const shell = cn(
    "block w-full rounded-2xl border p-4 text-left shadow-sm transition-colors",
    palette.shell,
    onClick &&
      "cursor-pointer hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
    active && "ring-1 ring-primary",
    className,
    classNames?.root,
  );

  if (!onClick) return <div className={shell}>{body}</div>;

  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={shell}>
      {body}
    </button>
  );
}

export interface StatTileRowProps {
  children: ReactNode;
  className?: string;
}

/** Responsive grid for a row of StatTiles: 1 / 2 / 4 columns. */
export function StatTileRow({ children, className }: StatTileRowProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}
