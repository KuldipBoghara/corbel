"use client";

import { Fragment, useEffect, useRef, useState, type Key, type ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { Button } from "./Button.js";
import { EmptyState, ErrorState, Spinner } from "./Feedback.js";

export interface UseInfiniteScrollOptions {
  /** There is another page to load. */
  hasMore?: boolean;
  /** A page request is in flight. The observer pauses until it settles. */
  loading?: boolean;
  /** Pauses loading, e.g. after a failed page so it is not retried in a loop. */
  disabled?: boolean;
  onLoadMore?: () => void;
  /** How early to load, as a CSS margin around the viewport. @default "200px" */
  rootMargin?: string;
}

/**
 * Calls `onLoadMore` when the returned ref's element scrolls into view.
 * Attach the ref to an empty sentinel after the last row.
 *
 * The observer is rebuilt each time `loading` settles, so a page too short to
 * fill the screen keeps pulling the next one until the sentinel is out of view.
 */
export function useInfiniteScroll({
  hasMore = false,
  loading = false,
  disabled = false,
  onLoadMore,
  rootMargin = "200px",
}: UseInfiniteScrollOptions): (node: Element | null) => void {
  const [node, setNode] = useState<Element | null>(null);
  // Latest callback without re-creating the observer (an inline arrow changes every render).
  const callback = useRef(onLoadMore);
  useEffect(() => {
    callback.current = onLoadMore;
  });

  useEffect(() => {
    if (!node || !hasMore || loading || disabled || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) callback.current?.();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, hasMore, loading, disabled, rootMargin]);

  return setNode;
}

export type InfiniteListSlot = "list" | "footer";

export interface InfiniteListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T, index: number) => Key;
  /** There is another page to load. */
  hasMore?: boolean;
  /** The next page is loading: shows a spinner under the items. */
  loadingMore?: boolean;
  /** Called when the end of the list scrolls into view. */
  onLoadMore?: () => void;
  /** First load. Shows a spinner while there are no items yet. */
  loading?: boolean;
  /**
   * Load error. With no items it replaces the list; otherwise it shows under
   * the items and stops auto-loading until `onRetry`. `true` uses the default message.
   */
  error?: ReactNode;
  onRetry?: () => void;
  /** Shown when there are no items. @default <EmptyState /> */
  empty?: ReactNode;
  /** Shown after the last page, e.g. "You're all caught up". */
  endMessage?: ReactNode;
  /** @default "200px" */
  rootMargin?: string;
  /** Element wrapping the items. Use `"ul"` / `"ol"` when `renderItem` returns `<li>`s. @default "div" */
  as?: "div" | "ul" | "ol";
  /** Styles the root. Add `overflow-y-auto` and a height to scroll inside it. */
  className?: string;
  classNames?: Partial<Record<InfiniteListSlot, string>>;
}

/**
 * A list that loads the next page as you scroll to its end.
 *
 * ```tsx
 * <InfiniteList
 *   items={posts}
 *   getItemKey={(p) => p.id}
 *   renderItem={(p) => <PostCard post={p} />}
 *   hasMore={hasNextPage}
 *   loadingMore={isFetchingNextPage}
 *   onLoadMore={fetchNextPage}
 * />
 * ```
 */
export function InfiniteList<T>({
  items,
  renderItem,
  getItemKey,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  loading = false,
  error,
  onRetry,
  empty,
  endMessage,
  rootMargin,
  as: List = "div",
  className,
  classNames,
}: InfiniteListProps<T>) {
  const hasError = error != null && error !== false;
  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    disabled: hasError,
    onLoadMore,
    rootMargin,
  });
  const errorMessage = error === true ? undefined : error;

  let body: ReactNode;
  if (items.length === 0) {
    body = hasError ? (
      <ErrorState message={errorMessage} onRetry={onRetry} />
    ) : loading ? (
      <div className="flex justify-center py-14">
        <Spinner size={32} label="Loading" />
      </div>
    ) : (
      (empty ?? <EmptyState />)
    );
  } else {
    const retry = onRetry ?? onLoadMore;
    const footer = loadingMore ? (
      <Spinner size={24} label="Loading more" />
    ) : hasError ? (
      <div role="alert" className="flex flex-col items-center gap-2">
        <p className="text-error">{errorMessage ?? "Couldn't load more."}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry}>
            Try again
          </Button>
        )}
      </div>
    ) : !hasMore && endMessage ? (
      <p className="text-text-muted">{endMessage}</p>
    ) : null;

    body = (
      <>
        <List className={classNames?.list}>
          {items.map((item, i) => (
            <Fragment key={getItemKey(item, i)}>{renderItem(item, i)}</Fragment>
          ))}
        </List>
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
        {footer && (
          <div className={cn("flex flex-col items-center py-3 text-sm", classNames?.footer)}>
            {footer}
          </div>
        )}
      </>
    );
  }

  return (
    <div aria-busy={loading || loadingMore || undefined} className={className}>
      {body}
    </div>
  );
}
