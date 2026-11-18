"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn.js";
import { fieldBaseClass } from "./Input.js";

export type PageRangeItem = number | "ellipsis";

/**
 * Page numbers to show, with `"ellipsis"` for gaps. Always includes the first
 * and last page plus `siblings` pages either side of `page`. A gap of exactly
 * one page shows that page instead of an ellipsis.
 *
 * `getPageRange(5, 10)` → `[1, "ellipsis", 4, 5, 6, "ellipsis", 10]`
 */
export function getPageRange(page: number, totalPages: number, siblings = 1): PageRangeItem[] {
  const out: PageRangeItem[] = [];
  let previous = 0;
  for (let p = 1; p <= totalPages; p++) {
    if (p !== 1 && p !== totalPages && Math.abs(p - page) > siblings) continue;
    if (p - previous === 2) out.push(previous + 1);
    else if (p - previous > 2) out.push("ellipsis");
    out.push(p);
    previous = p;
  }
  return out;
}

export type PaginationSlot = "summary" | "pageSize" | "pages" | "button";

export interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Total number of rows across all pages. */
  total: number;
  onPageChange: (page: number) => void;
  /** Supply to show the rows-per-page selector. Reset `page` to 1 when it fires. */
  onPageSizeChange?: (pageSize: number) => void;
  /** @default [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Pages shown either side of the current one. @default 1 */
  siblings?: number;
  /** Styles the root `<nav>`. */
  className?: string;
  classNames?: Partial<Record<PaginationSlot, string>>;
}

const buttonClass = cn(
  "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors",
  "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-40",
);
const idleClass = "border border-border-default text-text-secondary hover:bg-bg-main";

/**
 * "Showing 1–10 of 42", an optional rows-per-page selector, and page buttons.
 *
 * ```tsx
 * <Pagination page={page} pageSize={20} total={meta.total} onPageChange={setPage} />
 * ```
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  siblings = 1,
  className,
  classNames,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <p className={cn("text-xs text-text-secondary", classNames?.summary)}>
          Showing <span className="font-semibold text-text-primary">{from}</span>–
          <span className="font-semibold text-text-primary">{to}</span> of{" "}
          <span className="font-semibold text-text-primary">{total}</span>
        </p>

        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span>Display</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className={cn(fieldBaseClass, "h-8 w-auto px-2 text-xs font-semibold", classNames?.pageSize)}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </label>
        )}
      </div>

      {/* The size selector is useful on one page; page buttons are not. */}
      {totalPages > 1 && (
        <div className={cn("flex items-center gap-1", classNames?.pages)}>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className={cn(buttonClass, idleClass, "px-0", classNames?.button)}
          >
            <ChevronLeft size={16} />
          </button>

          {getPageRange(page, totalPages, siblings).map((p, i) =>
            p === "ellipsis" ? (
              <span key={`gap-${i}`} aria-hidden className="px-1.5 text-xs text-text-muted">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => p !== page && onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  buttonClass,
                  p === page ? "bg-primary text-primary-contrast" : idleClass,
                  classNames?.button,
                )}
              >
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className={cn(buttonClass, idleClass, "px-0", classNames?.button)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
