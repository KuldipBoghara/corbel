"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../utils/cn.js";
import { EmptyState, ErrorState, Spinner } from "./Feedback.js";
import { useInfiniteScroll } from "./InfiniteList.js";
import { Pagination, type PaginationProps } from "./Pagination.js";

export type RowKey = string | number;
export type SortDirection = "asc" | "desc";
export type ColumnAlign = "left" | "center" | "right";

export interface SortState {
  /** The sorted column's `sortKey` (or `key`). */
  key: string;
  direction: SortDirection;
}

export interface Column<T> {
  /** Unique column id. Without `cell`, also the row property shown. */
  key: string;
  header: ReactNode;
  /** Cell content. Defaults to `String(row[key])`. */
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  /** Key reported in `onSortChange` when it differs from `key` (e.g. an API field name). */
  sortKey?: string;
  /** CSS width, e.g. `120` or `"20%"`. */
  width?: number | string;
  minWidth?: number | string;
  /** @default "left" */
  align?: ColumnAlign;
  /** Classes for this column's `<td>`s. */
  className?: string;
  /** Classes for this column's `<th>`. */
  headerClassName?: string;
  /** With `stackOnMobile`: leave this column out of the mobile cards. */
  hideOnMobile?: boolean;
  /** With `stackOnMobile`: show this column as the card's title. Defaults to the first column. */
  primary?: boolean;
}

export type DataTableSlot =
  | "scroll"
  | "table"
  | "thead"
  | "th"
  | "tbody"
  | "tr"
  | "td"
  | "card"
  | "pagination";

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => RowKey;
  /** Loading. With no rows shows a spinner; with rows, dims them (a refetch). */
  loading?: boolean;
  /** Load error; replaces the rows. `true` uses the default message. */
  error?: ReactNode;
  onRetry?: () => void;
  /** @default "No data found" */
  emptyTitle?: ReactNode;
  emptyMessage?: ReactNode;
  /** A button under the empty message, e.g. "Add the first one". */
  emptyAction?: ReactNode;
  /** Current sort, controlled. */
  sort?: SortState | null;
  /** Called when a sortable header is clicked: new column → asc, same column → flips. */
  onSortChange?: (sort: SortState) => void;
  /** Selected row keys, controlled. Selection is on when `onSelectionChange` is set. */
  selectedKeys?: RowKey[];
  onSelectionChange?: (keys: RowKey[]) => void;
  onRowClick?: (row: T) => void;
  /** Shows a Pagination under the table. */
  pagination?: Omit<PaginationProps, "className" | "classNames">;
  /** Infinite scroll instead of pages: append rows as the end of the table scrolls into view. */
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Below the `md` breakpoint, show one card per row instead of the table. */
  stackOnMobile?: boolean;
  /** Keeps the header visible while the `scroll` slot scrolls (give it a max height). @default true */
  stickyHeader?: boolean;
  /** With `stackOnMobile`: content at the bottom of each mobile card, e.g. actions. */
  renderCardFooter?: (row: T) => ReactNode;
  /** Accessible table name. */
  caption?: string;
  /** Styles the root (bordered box). */
  className?: string;
  classNames?: Partial<Record<DataTableSlot, string>>;
}

const ALIGN: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const checkboxClass = "size-4 cursor-pointer accent-primary";

function defaultCell(row: unknown, key: string): ReactNode {
  const value = (row as Record<string, unknown> | null)?.[key];
  return value == null ? "" : String(value);
}

function renderCell<T>(col: Column<T>, row: T, index: number) {
  return col.cell ? col.cell(row, index) : defaultCell(row, col.key);
}

/** Header checkbox in the mixed state when only some rows are selected. */
function SelectAll({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" aria-label="Select all rows" checked={checked} onChange={onChange} className={checkboxClass} />
  );
}

/**
 * Table with typed columns, controlled sorting, selection and pagination, and
 * built-in loading, empty and error states. It fetches nothing: wire it to your
 * data hook from the app.
 *
 * ```tsx
 * <DataTable
 *   columns={[{ key: "name", header: "Name", sortable: true }]}
 *   rows={data?.items ?? []}
 *   getRowKey={(r) => r.id}
 *   loading={isFetching}
 *   sort={sort}
 *   onSortChange={setSort}
 *   pagination={{ page, pageSize: 20, total: data?.total ?? 0, onPageChange: setPage }}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  error,
  onRetry,
  emptyTitle = "No data found",
  emptyMessage,
  emptyAction,
  sort,
  onSortChange,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  pagination,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  stackOnMobile = false,
  stickyHeader = true,
  renderCardFooter,
  caption,
  className,
  classNames,
}: DataTableProps<T>) {
  const hasError = error != null && error !== false;
  const selectable = Boolean(onSelectionChange);
  const selected = new Set(selectedKeys);
  const rowKeys = rows.map(getRowKey);
  const selectedOnPage = rowKeys.filter((k) => selected.has(k)).length;
  const allSelected = rows.length > 0 && selectedOnPage === rows.length;
  const colSpan = columns.length + (selectable ? 1 : 0);
  const showRows = !hasError && rows.length > 0;

  const scrollOptions = { hasMore, loading: loading || loadingMore, disabled: hasError, onLoadMore };
  // One sentinel per layout: the hidden one (display: none) never intersects.
  const tableSentinel = useInfiniteScroll(scrollOptions);
  const cardSentinel = useInfiniteScroll(scrollOptions);

  const toggleRow = (key: RowKey) =>
    onSelectionChange?.(selected.has(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key]);

  // Select all acts on the visible rows and keeps selections from other pages.
  const toggleAll = () => {
    const onPage = new Set(rowKeys);
    onSelectionChange?.(
      allSelected
        ? selectedKeys.filter((k) => !onPage.has(k))
        : [...selectedKeys, ...rowKeys.filter((k) => !selected.has(k))],
    );
  };

  const handleSort = (col: Column<T>) => {
    const key = col.sortKey ?? col.key;
    onSortChange?.({
      key,
      direction: sort?.key === key && sort.direction === "asc" ? "desc" : "asc",
    });
  };

  const rowHandlers = (row: T) =>
    onRowClick
      ? {
          onClick: () => onRowClick(row),
          onKeyDown: (e: KeyboardEvent) => {
            if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onRowClick(row);
            }
          },
          tabIndex: 0,
        }
      : {};

  const rowCheckbox = (key: RowKey) => (
    <input
      type="checkbox"
      aria-label="Select row"
      checked={selected.has(key)}
      onChange={() => toggleRow(key)}
      onClick={(e) => e.stopPropagation()}
      className={checkboxClass}
    />
  );

  let state: ReactNode = null;
  if (hasError) {
    state = <ErrorState message={error === true ? undefined : error} onRetry={onRetry} />;
  } else if (rows.length === 0) {
    state = loading ? (
      <div className="flex justify-center py-16">
        <Spinner size={32} label="Loading" />
      </div>
    ) : (
      <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
    );
  }

  const primaryColumn = columns.find((c) => c.primary) ?? columns[0];
  const cardColumns = columns.filter((c) => !c.hideOnMobile && c !== primaryColumn);

  return (
    <div
      aria-busy={loading || loadingMore || undefined}
      className={cn("overflow-hidden rounded-xl border border-border-default bg-bg-card shadow-sm", className)}
    >
      <div
        className={cn(
          "w-full overflow-x-auto",
          stackOnMobile && "hidden md:block",
          classNames?.scroll,
        )}
      >
        <table
          className={cn(
            "w-full border-collapse text-sm",
            loading && rows.length > 0 && "opacity-60 transition-opacity",
            classNames?.table,
          )}
        >
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className={cn("border-b border-border-default bg-bg-main", classNames?.thead)}>
            <tr>
              {selectable && (
                <th scope="col" className={cn("w-10 px-4 py-3", stickyHeader && "sticky top-0 z-10 bg-bg-main", classNames?.th)}>
                  <SelectAll
                    checked={allSelected}
                    indeterminate={selectedOnPage > 0 && !allSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => {
                const key = col.sortKey ?? col.key;
                const active = col.sortable && sort?.key === key ? sort.direction : undefined;
                const SortIcon = active === "asc" ? ChevronUp : active === "desc" ? ChevronDown : ChevronsUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active === "asc" ? "ascending" : active === "desc" ? "descending" : undefined}
                    style={{ width: col.width, minWidth: col.minWidth }}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-text-secondary uppercase",
                      ALIGN[col.align ?? "left"],
                      stickyHeader && "sticky top-0 z-10 bg-bg-main",
                      classNames?.th,
                      col.headerClassName,
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col)}
                        disabled={loading}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded [text-transform:inherit] hover:text-text-primary",
                          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                        )}
                      >
                        {col.header}
                        <SortIcon size={14} aria-hidden className={active ? "text-text-primary" : "text-text-muted"} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={cn("divide-y divide-border-light", classNames?.tbody)}>
            {showRows ? (
              rows.map((row, index) => {
                const key = rowKeys[index] as RowKey;
                const isSelected = selected.has(key);
                return (
                  <tr
                    key={key}
                    {...rowHandlers(row)}
                    aria-selected={selectable ? isSelected : undefined}
                    className={cn(
                      "transition-colors hover:bg-bg-main/60",
                      onRowClick && "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                      isSelected && "bg-primary-50 hover:bg-primary-50",
                      classNames?.tr,
                    )}
                  >
                    {selectable && <td className={cn("w-10 px-4 py-3", classNames?.td)}>{rowCheckbox(key)}</td>}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ width: col.width, minWidth: col.minWidth }}
                        className={cn(
                          "px-4 py-3 align-middle text-text-primary",
                          ALIGN[col.align ?? "left"],
                          classNames?.td,
                          col.className,
                        )}
                      >
                        {renderCell(col, row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={colSpan}>{state}</td>
              </tr>
            )}
          </tbody>
        </table>
        {showRows && <div ref={tableSentinel} aria-hidden className="h-px" />}
      </div>

      {stackOnMobile && (
        <div className="md:hidden">
          {showRows ? (
            <div className={cn("space-y-3 p-3", loading && "opacity-60 transition-opacity")}>
              {rows.map((row, index) => {
                const key = rowKeys[index] as RowKey;
                return (
                  <div
                    key={key}
                    {...rowHandlers(row)}
                    className={cn(
                      "rounded-xl border border-border-default bg-bg-card p-4 shadow-sm",
                      onRowClick && "cursor-pointer active:bg-bg-main",
                      selected.has(key) && "border-primary bg-primary-50",
                      classNames?.card,
                    )}
                  >
                    {(selectable || primaryColumn) && (
                      <div className="mb-3 flex items-start gap-3 text-sm font-semibold text-text-primary">
                        {selectable && rowCheckbox(key)}
                        {primaryColumn && <div className="min-w-0 flex-1">{renderCell(primaryColumn, row, index)}</div>}
                      </div>
                    )}
                    <dl className="space-y-2">
                      {cardColumns.map((col) => (
                        <div key={col.key} className="flex items-start justify-between gap-3">
                          <dt className="text-[11px] font-bold tracking-wide text-text-muted uppercase">{col.header}</dt>
                          <dd className="min-w-0 text-right text-sm text-text-primary">{renderCell(col, row, index)}</dd>
                        </div>
                      ))}
                    </dl>
                    {renderCardFooter && (
                      <div className="mt-3 border-t border-border-light pt-3">{renderCardFooter(row)}</div>
                    )}
                  </div>
                );
              })}
              <div ref={cardSentinel} aria-hidden className="h-px" />
            </div>
          ) : (
            state
          )}
        </div>
      )}

      {showRows && loadingMore && (
        <div className="flex justify-center border-t border-border-light py-3">
          <Spinner size={24} label="Loading more" />
        </div>
      )}

      {showRows && pagination && (
        <Pagination {...pagination} className={cn("border-t border-border-default", classNames?.pagination)} />
      )}
    </div>
  );
}
