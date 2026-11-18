"use client";

import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { BackLink } from "./BackLink.js";

export type PageHeaderSlot = "root" | "back" | "title" | "description" | "actions";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons on the right. */
  actions?: ReactNode;
  /** Back link above the title: `href` renders an `<a>`, `onClick` a `<button>`. */
  back?: { label: ReactNode; href?: string; onClick?: () => void };
  className?: string;
  classNames?: Partial<Record<PageHeaderSlot, string>>;
}

/**
 * Title block at the top of a page.
 *
 * ```tsx
 * <PageHeader
 *   title="Orders"
 *   description="Everything placed this month"
 *   back={{ label: "Dashboard", href: "/" }}
 *   actions={<Button>New order</Button>}
 * />
 * ```
 */
export function PageHeader({ title, description, actions, back, className, classNames }: PageHeaderProps) {
  return (
    <div className={cn("mb-5", className, classNames?.root)}>
      {back && <BackLink {...back} size="sm" className={cn("mb-2", classNames?.back)} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            className={cn(
              "text-xl font-black tracking-tight text-text-primary sm:text-2xl",
              classNames?.title,
            )}
          >
            {title}
          </h1>
          {description && (
            <p className={cn("mt-1 max-w-2xl text-sm text-text-secondary", classNames?.description)}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className={cn("flex shrink-0 flex-wrap items-center gap-2", classNames?.actions)}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
