"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";
import { fieldBaseClass, fieldErrorClass } from "./Input.js";
import { EmptyState, ErrorState, Spinner } from "./Feedback.js";

export type ListKey = string | number;
export type SearchSelectListSlot = FieldSlot | "search" | "list" | "item";

interface SearchSelectListBaseProps<T> extends FieldProps {
  /** Rows to show. With `page`, only that page's rows (the list keeps earlier pages). */
  items: T[];
  getKey: (item: T) => ListKey;
  /** Plain-text label; used for the default row and local search. */
  getLabel: (item: T) => string;
  /** Replaces the row content (avatar, subtitle …). */
  renderItem?: (item: T, state: { selected: boolean }) => ReactNode;
  /** Muted content pinned to the right of a row (an employee id, a role). */
  renderTrailing?: (item: T) => ReactNode;
  isItemDisabled?: (item: T) => boolean;
  /**
   * Items the caller already knows for the selected keys, so a selection that is
   * not in `items` (searched away, not paged in yet) still shows, pinned on top.
   */
  selectedItems?: T[];
  /** Keys to hide, e.g. what a sibling picker already holds. */
  excludeKeys?: ListKey[];

  /** Controlled search text. Omit to let the list hold it. */
  search?: string;
  /** Called (debounced by `searchDelay`) as the user types. Set it to search server-side; omit it to filter `items` locally by label. */
  onSearchChange?: (search: string) => void;
  /** @default 300 */
  searchDelay?: number;
  /** @default "Search…" */
  searchPlaceholder?: string;

  /** Current page number. Page 1 replaces the rows, later pages are appended. Omit when `items` is already the full list. */
  page?: number;
  loading?: boolean;
  /** More rows exist: scrolling to the bottom calls `onLoadMore`. */
  hasMore?: boolean;
  onLoadMore?: () => void;
  /** Loading failed. A string replaces the default message. */
  loadError?: ReactNode;
  onRetry?: () => void;
  /** @default "No results" */
  emptyMessage?: ReactNode;

  /** Shows "(n selected)" after the label in multiple mode. @default true */
  showCount?: boolean;
  disabled?: boolean;
  /** Height of the scroll box, in px. @default 200 */
  height?: number;
  id?: string;
  /** Styles the root. */
  className?: string;
  classNames?: Partial<Record<SearchSelectListSlot, string>>;
}

export interface SearchSelectListMultiProps<T> extends SearchSelectListBaseProps<T> {
  /** @default true */
  multiple?: true;
  value: ListKey[];
  onChange: (keys: ListKey[], items: T[]) => void;
}

export interface SearchSelectListSingleProps<T> extends SearchSelectListBaseProps<T> {
  multiple: false;
  value: ListKey | null;
  onChange: (key: ListKey | null, item: T | null) => void;
  /** First radio, which clears the selection. `null` hides it. @default "None" */
  noneLabel?: ReactNode;
}

export type SearchSelectListProps<T> = SearchSelectListMultiProps<T> | SearchSelectListSingleProps<T>;

/**
 * Fixed-height, searchable list of checkboxes (or radios with `multiple={false}`)
 * that loads more as it is scrolled. It fetches nothing: pass `items` plus
 * `loading` / `hasMore` / `onLoadMore`, and wrap it around your API hook.
 *
 * ```tsx
 * <SearchSelectList label="Workers" items={workers} getKey={(w) => w.id} getLabel={(w) => w.name}
 *   value={ids} onChange={setIds} />
 * ```
 */
export function SearchSelectList<T>(props: SearchSelectListProps<T>) {
  const {
    items,
    getKey,
    getLabel,
    renderItem,
    renderTrailing,
    isItemDisabled,
    selectedItems = [],
    excludeKeys = [],
    search,
    onSearchChange,
    searchDelay = 300,
    searchPlaceholder = "Search…",
    page,
    loading = false,
    hasMore = false,
    onLoadMore,
    loadError,
    onRetry,
    emptyMessage = "No results",
    showCount = true,
    disabled = false,
    height = 200,
    id,
    label,
    hint,
    error,
    required,
    optional,
    className,
    classNames,
  } = props;
  const multiple = props.multiple !== false;
  const selectedKeys: ListKey[] = props.multiple === false ? (props.value == null ? [] : [props.value]) : props.value;
  const groupName = useId();

  // Search text: local for instant typing, reported debounced, synced from a controlled `search`.
  const [text, setText] = useState(search ?? "");
  useEffect(() => {
    if (search !== undefined) setText(search);
  }, [search]);
  const lastSent = useRef(search ?? "");
  useEffect(() => {
    if (!onSearchChange || text === lastSent.current) return;
    const t = setTimeout(() => {
      lastSent.current = text;
      onSearchChange(text);
    }, searchDelay);
    return () => clearTimeout(t);
  }, [text, onSearchChange, searchDelay]);

  // Pages accumulate: page 1 replaces, later pages append unseen rows.
  const [pages, setPages] = useState<T[]>(items);
  useEffect(() => {
    setPages((prev) => {
      if (!page || page <= 1) return prev.length === 0 && items.length === 0 ? prev : items;
      const seen = new Set(prev.map(getKey));
      return [...prev, ...items.filter((it) => !seen.has(getKey(it)))];
    });
    // getKey is a stable accessor from the caller; items/page drive this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, page]);
  const loaded = page === undefined ? items : pages;

  const query = text.trim().toLowerCase();
  const visible = loaded.filter(
    (it) =>
      !excludeKeys.includes(getKey(it)) &&
      (onSearchChange || !query || getLabel(it).toLowerCase().includes(query)),
  );

  const byKey = new Map<ListKey, T>();
  for (const it of [...selectedItems, ...loaded]) byKey.set(getKey(it), it);
  const visibleKeys = new Set(visible.map(getKey));
  const pinned = selectedKeys
    .filter((k) => !visibleKeys.has(k))
    .map((k) => byKey.get(k))
    .filter((it): it is T => it !== undefined);
  const rows = [...pinned, ...visible];

  const toggle = (key: ListKey) => {
    if (props.multiple === false) {
      props.onChange(key, byKey.get(key) ?? null);
      return;
    }
    const next = selectedKeys.includes(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key];
    props.onChange(
      next,
      next.map((k) => byKey.get(k)).filter((it): it is T => it !== undefined),
    );
  };

  // Infinite scroll: a sentinel at the bottom of the box triggers onLoadMore.
  const boxRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;
  const canLoadMore = hasMore && !loading && !loadError;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!canLoadMore || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMoreRef.current?.();
      },
      { root: boxRef.current, rootMargin: "60px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canLoadMore, rows.length]);

  const noneLabel = props.multiple === false ? (props.noneLabel === undefined ? "None" : props.noneLabel) : null;
  const control = (key: string, checked: boolean, onSelect: () => void, itemDisabled: boolean, content: ReactNode) => (
    <label
      className={cn(
        "flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-sm text-text-primary",
        (disabled || itemDisabled) && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        type={multiple ? "checkbox" : "radio"}
        name={multiple ? undefined : groupName}
        value={key}
        checked={checked}
        disabled={disabled || itemDisabled}
        onChange={onSelect}
        className="size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
      />
      <span className="min-w-0 flex-1 truncate">{content}</span>
    </label>
  );

  let body: ReactNode;
  if (loadError && rows.length === 0) {
    body = (
      <ErrorState
        title={typeof loadError === "string" ? loadError : "Could not load"}
        onRetry={onRetry}
        className="h-full py-4"
      />
    );
  } else if (loading && rows.length === 0) {
    body = (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );
  } else if (rows.length === 0) {
    body = <EmptyState title={emptyMessage} className="h-full py-4" />;
  } else {
    body = (
      <ul className="flex flex-col gap-2.5">
        {noneLabel != null && (
          <li className={cn("flex items-center", classNames?.item)}>
            {control(
              "",
              selectedKeys.length === 0,
              () => props.multiple === false && props.onChange(null, null),
              false,
              <span className="text-text-secondary">{noneLabel}</span>,
            )}
          </li>
        )}
        {rows.map((it) => {
          const key = getKey(it);
          const selected = selectedKeys.includes(key);
          return (
            <li key={key} className={cn("flex items-center gap-3", classNames?.item)}>
              {control(
                String(key),
                selected,
                () => toggle(key),
                !!isItemDisabled?.(it),
                renderItem ? renderItem(it, { selected }) : getLabel(it),
              )}
              {renderTrailing && (
                <span className="shrink-0 font-mono text-xs text-text-muted">{renderTrailing(it)}</span>
              )}
            </li>
          );
        })}
        {loadError ? (
          <li className="flex items-center justify-center gap-2 py-1 text-xs text-error">
            {typeof loadError === "string" ? loadError : "Could not load more"}
            {onRetry && (
              <button type="button" onClick={onRetry} className="cursor-pointer font-semibold text-primary hover:underline">
                Try again
              </button>
            )}
          </li>
        ) : loading ? (
          <li className="flex justify-center py-1">
            <Spinner size={16} label="Loading more" />
          </li>
        ) : (
          hasMore && <li ref={sentinelRef} aria-hidden className="h-px" />
        )}
      </ul>
    );
  }

  return (
    <FormField
      id={id}
      label={
        label && (
          <>
            {label}
            {multiple && showCount && selectedKeys.length > 0 && (
              <span className="ml-1.5 font-normal text-text-secondary">({selectedKeys.length} selected)</span>
            )}
          </>
        )
      }
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
      classNames={classNames}
    >
      {({ id: searchId, describedBy, invalid }) => (
        <>
          <div className="relative mb-2">
            <Search
              size={15}
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
            />
            <input
              id={searchId}
              type="search"
              value={text}
              disabled={disabled}
              onChange={(e) => setText(e.target.value)}
              placeholder={searchPlaceholder}
              aria-describedby={describedBy}
              className={cn(fieldBaseClass, "h-10 pr-3 pl-9", classNames?.search)}
            />
          </div>
          <div
            ref={boxRef}
            role="group"
            aria-label={typeof label === "string" ? label : undefined}
            aria-invalid={invalid || undefined}
            aria-busy={loading || undefined}
            style={{ height }}
            className={cn(
              "corbel-scrollbar overflow-y-auto rounded-lg border border-border-default bg-bg-card px-3 py-2.5",
              invalid && fieldErrorClass,
              classNames?.list,
            )}
          >
            {body}
          </div>
        </>
      )}
    </FormField>
  );
}
