"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn.js";

export type SkeletonVariant = "text" | "rect" | "circle";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** `text` is a line of text height, `rect` a block, `circle` an avatar. @default "rect" */
  variant?: SkeletonVariant;
  /** For `text`: renders this many lines, the last one shorter. @default 1 */
  lines?: number;
}

const VARIANTS: Record<SkeletonVariant, string> = {
  text: "h-3.5 w-full rounded",
  rect: "h-24 w-full rounded-xl",
  circle: "size-10 rounded-full",
};

const base = "animate-pulse bg-border-default motion-reduce:animate-none";

/**
 * Grey placeholder shown while content loads. Size it with `className`.
 * Hidden from screen readers: put `aria-busy` on the region that is loading.
 *
 * ```tsx
 * <Skeleton variant="circle" />
 * <Skeleton variant="text" lines={3} />
 * <Skeleton className="h-40" />
 * ```
 */
export function Skeleton({ variant = "rect", lines = 1, className, ...props }: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div aria-hidden className={cn("flex flex-col gap-2", className)} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={cn(base, VARIANTS.text, i === lines - 1 && "w-3/5")} />
        ))}
      </div>
    );
  }
  return <div aria-hidden className={cn(base, VARIANTS[variant], className)} {...props} />;
}
