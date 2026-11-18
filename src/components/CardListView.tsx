"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn.js";
import { EmptyState } from "./Feedback.js";
import { InfiniteList } from "./InfiniteList.js";
import { SortableItem, SortableList, useSortableOrder, type ReorderMove, type SortableId } from "./SortableList.js";

export type CardActionTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";
export type CardListVariant = "card" | "flush";

type PerRow<T, V> = V | ((row: T) => V);

export interface CardAction<T> {
  /** Stable React key. */
  key: string;
  /** Tooltip and accessible name. May vary per row (e.g. "Activate" / "Deactivate"). */
  label: PerRow<T, string>;
  icon: PerRow<T, ReactNode>;
  /** @default "neutral" */
  tone?: PerRow<T, CardActionTone>;
  onClick: (row: T) => void;
  /** Leaves the action out for this row. */
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export type CardListViewSlot = "list" | "row" | "header" | "code" | "title" | "meta" | "badge" | "actions" | "expanded";

export interface CardListViewProps<T> {
  rows: T[];
  getRowKey: (row: T) => SortableId;
  /** First load: a spinner while there are no rows. With rows they stay in place. */
  loading?: boolean;
  /** Load error. `true` uses the default message. */
  error?: ReactNode;
  onRetry?: () => void;
  /** @default "No data found" */
  emptyTitle?: ReactNode;
  emptyMessage?: ReactNode;
  emptyAction?: ReactNode;
  /** Infinite scroll: there is another page. */
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Small leading identifier, e.g. a code. */
  renderCode?: (row: T) => ReactNode;
  /** Headline. */
  renderTitle: (row: T) => ReactNode;
  /** Supporting line. A string truncates to one line; a node may wrap. */
  renderMeta?: (row: T) => ReactNode;
  /** Pill before the actions. */
  renderBadge?: (row: T) => ReactNode;
  /** Set it and each row gets a chevron that reveals this panel. Several rows may be open. */
  renderExpanded?: (row: T) => ReactNode;
  /** Icon buttons at the end of each row. */
  actions?: CardAction<T>[];
  /**
   * Set it and each row gets a drag grip. Indexes are zero-based positions in
   * `rows`, so only pass it while the list shows every row in stored order
   * (not while filtered). Return a promise that rejects to roll the move back.
   */
  onReorder?: (move: ReorderMove) => void | Promise<unknown>;
  /** "card": separate bordered cards. "flush": divided rows inside your own container. @default "card" */
  variant?: CardListVariant;
  /** Extra classes per row, e.g. to fade an inactive one. */
  rowClassName?: (row: T) => string | undefined;
  /** Styles the scroll container. Pass e.g. `"max-h-[480px]"` or `"flex-1 min-h-0"`. */
  className?: string;
  classNames?: Partial<Record<CardListViewSlot, string>>;
}

const TONES: Record<CardActionTone, string> = {
  neutral: "text-text-secondary hover:bg-bg-main hover:text-text-primary",
  primary: "text-primary hover:bg-primary-50 hover:text-primary-dark",
  success: "text-success hover:bg-success/10",
  warning: "text-warning hover:bg-warning/10",
  error: "text-error hover:bg-error/10",
  info: "text-info hover:bg-info/10",
};

const VARIANTS: Record<CardListVariant, { list: string; row: string; header: string; expanded: string }> = {
  card: {
    list: "flex flex-col gap-3",
    row: "rounded-xl border border-border-default bg-bg-card shadow-sm transition-colors hover:border-primary/40",
    header: "px-6 py-4",
    expanded: "px-6 pb-5",
  },
  flush: {
    list: "flex flex-col",
    row: "border-b border-border-light transition-colors last:border-b-0 hover:bg-bg-main/50",
    header: "px-5 py-3",
    expanded: "px-5 pb-4",
  },
};

function resolve<T, V>(value: PerRow<T, V>, row: T): V {
  return typeof value === "function" ? (value as (row: T) => V)(row) : value;
}

/**
 * Card-per-row listing for simple records (a code, a name, a few actions),
 * with infinite scroll, expandable rows and optional drag-to-reorder. Shares
 * DataTable's data contract, so a page can switch between the two.
 *
 * ```tsx
 * <CardListView
 *   rows={departments}
 *   getRowKey={(d) => d.id}
 *   renderCode={(d) => d.code}
 *   renderTitle={(d) => d.name}
 *   actions={[{ key: "edit", label: "Edit", icon: <Pencil size={18} />, onClick: edit }]}
 *   hasMore={hasNextPage}
 *   onLoadMore={fetchNextPage}
 *   className="max-h-[480px]"
 * />
 * ```
 */
export function CardListView<T>({
  rows,
  getRowKey,
  loading = false,
  error,
  onRetry,
  emptyTitle = "No data found",
  emptyMessage,
  emptyAction,
  hasMore,
  loadingMore,
  onLoadMore,
  renderCode,
  renderTitle,
  renderMeta,
  renderBadge,
  renderExpanded,
  actions = [],
  onReorder,
  variant = "card",
  rowClassName,
  className,
  classNames,
}: CardListViewProps<T>) {
  const styles = VARIANTS[variant];
  const sortable = Boolean(onReorder);
  const idPrefix = useId();
  const [expanded, setExpanded] = useState<ReadonlySet<SortableId>>(() => new Set());

  // A fresh `rows` (the server confirming or rejecting the move) drops the optimistic order.
  const { orderedItems, keys, handleReorder } = useSortableOrder({
    items: rows,
    getKey: getRowKey,
    onReorder,
    resetKey: rows,
  });

  const toggle = (key: SortableId) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const renderRow = (row: T) => {
    const key = getRowKey(row);
    const isExpanded = Boolean(renderExpanded) && expanded.has(key);
    const panelId = `${idPrefix}-${key}`;
    const meta = renderMeta?.(row);
    const rowActions = actions.filter((a) => !a.hidden?.(row));

    return (
      <SortableItem id={key} disabled={!sortable} className={cn(styles.row, classNames?.row, rowClassName?.(row))}>
        {(grip) => (
          <>
            {/* Clicking anywhere on the header toggles; the chevron is the keyboard control. */}
            <div
              className={cn("flex items-center gap-4", styles.header, renderExpanded && "cursor-pointer", classNames?.header)}
              onClick={renderExpanded ? () => toggle(key) : undefined}
            >
              {grip}
              {renderExpanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(key);
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={isExpanded ? panelId : undefined}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  className="shrink-0 cursor-pointer rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-main hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-baseline gap-3">
                  {renderCode && (
                    <span className={cn("shrink-0 font-mono text-xs font-semibold text-text-secondary", classNames?.code)}>
                      {renderCode(row)}
                    </span>
                  )}
                  <span className={cn("truncate text-base font-bold text-text-primary", classNames?.title)}>
                    {renderTitle(row)}
                  </span>
                </div>
                {meta != null &&
                  meta !== false &&
                  (typeof meta === "string" ? (
                    <p className={cn("mt-1 truncate text-xs text-text-secondary", classNames?.meta)}>{meta}</p>
                  ) : (
                    <div className={cn("mt-2", classNames?.meta)}>{meta}</div>
                  ))}
              </div>

              {renderBadge && <div className={cn("shrink-0", classNames?.badge)}>{renderBadge(row)}</div>}

              {rowActions.length > 0 && (
                <div
                  className={cn("flex shrink-0 items-center gap-1", classNames?.actions)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {rowActions.map((action) => {
                    const label = resolve(action.label, row);
                    return (
                      <button
                        key={action.key}
                        type="button"
                        title={label}
                        aria-label={label}
                        disabled={action.disabled?.(row)}
                        onClick={() => action.onClick(row)}
                        className={cn(
                          "cursor-pointer rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                          "disabled:cursor-not-allowed disabled:opacity-40",
                          TONES[resolve(action.tone ?? "neutral", row)],
                        )}
                      >
                        {resolve(action.icon, row)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {isExpanded && renderExpanded && (
              <div id={panelId} className={cn(styles.expanded, classNames?.expanded)}>
                {renderExpanded(row)}
              </div>
            )}
          </>
        )}
      </SortableItem>
    );
  };

  return (
    <SortableList items={keys} onReorder={handleReorder} disabled={!sortable}>
      <InfiniteList
        as="ul"
        items={orderedItems}
        getItemKey={getRowKey}
        renderItem={renderRow}
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={<EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
        className={cn("overflow-y-auto pr-1", className)}
        classNames={{ list: cn(styles.list, classNames?.list) }}
      />
    </SortableList>
  );
}
