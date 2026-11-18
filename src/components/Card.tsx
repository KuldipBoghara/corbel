"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes the inner padding, for cards that hold a full-bleed table or image. */
  flush?: boolean;
}

/**
 * The standard surface: rounded, bordered, on `bg-card`.
 *
 * ```tsx
 * <Card>
 *   <CardHeader title="Users" description="Everyone with access" action={<Button size="sm">Invite</Button>} />
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { flush = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border-default bg-bg-card shadow-sm",
        !flush && "p-5",
        className,
      )}
      {...props}
    />
  );
});

export type CardHeaderSlot = "root" | "title" | "description" | "action";

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** A button or menu on the right. */
  action?: ReactNode;
  className?: string;
  classNames?: Partial<Record<CardHeaderSlot, string>>;
}

/** Title, description and an action, laid out for the top of a Card. */
export function CardHeader({ title, description, action, className, classNames }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3",
        className,
        classNames?.root,
      )}
    >
      <div className="min-w-0">
        <h2 className={cn("text-sm font-bold tracking-tight text-text-primary", classNames?.title)}>
          {title}
        </h2>
        {description && (
          <p className={cn("mt-0.5 text-xs text-text-secondary", classNames?.description)}>
            {description}
          </p>
        )}
      </div>
      {action && <div className={cn("shrink-0", classNames?.action)}>{action}</div>}
    </div>
  );
}
