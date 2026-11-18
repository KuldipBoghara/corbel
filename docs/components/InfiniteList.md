# InfiniteList

A list that calls `onLoadMore` as its end scrolls into view, with initial-loading, empty and error states.

```tsx
import { InfiniteList, useInfiniteScroll } from "corbel";
```

## Usage

```tsx
// RTK Query infinite query, TanStack useInfiniteQuery, or your own page state
<InfiniteList
  items={posts}
  getItemKey={(p) => p.id}
  renderItem={(p) => <PostCard post={p} />}
  loading={isLoading}
  hasMore={hasNextPage}
  loadingMore={isFetchingNextPage}
  onLoadMore={fetchNextPage}
  error={isError && "Couldn't load posts."}
  onRetry={refetch}
  endMessage="You're all caught up"
/>
```

### Scrolling inside a box

Give the root a height and `overflow-y-auto`; the sentinel is still detected inside it.

```tsx
<InfiniteList className="max-h-96 overflow-y-auto" as="ul" renderItem={(t) => <li>{t.title}</li>} {...rest} />
```

### Behaviour

- `loading` with no items shows a spinner. With items, they stay on screen (a refetch).
- `error` with no items replaces the list. With items (a later page failed), it shows under them with a "Try again" button, and auto-loading stops so a failing request is not retried in a loop.
- The observer is rebuilt each time `loadingMore` goes back to `false`, so a page too short to fill the screen keeps pulling the next one.
- `onLoadMore` can be an inline arrow: the latest one is always called, without re-creating the observer.

### `useInfiniteScroll`

The observer on its own, for custom layouts (`DataTable` and `CardListView` use it):

```tsx
const sentinelRef = useInfiniteScroll({ hasMore, loading: isFetching, onLoadMore: fetchNextPage });
return (
  <>
    {rows.map(renderRow)}
    <div ref={sentinelRef} />
  </>
);
```

Options: `hasMore`, `loading`, `disabled`, `onLoadMore`, `rootMargin` (default `"200px"`).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | | The rows loaded so far, all pages together. |
| `renderItem` | `(item, index) => ReactNode` | | Renders one item. |
| `getItemKey` | `(item, index) => Key` | | Stable key per item. |
| `hasMore` | `boolean` | `false` | There is another page. |
| `loadingMore` | `boolean` | `false` | The next page is loading. Shows a spinner under the items. |
| `onLoadMore` | `() => void` | | Called when the end scrolls into view. |
| `loading` | `boolean` | `false` | First load. |
| `error` | `ReactNode` | | Error message; `true` uses the default. |
| `onRetry` | `() => void` | | Retry button handler. Falls back to `onLoadMore` for a failed later page. |
| `empty` | `ReactNode` | `<EmptyState />` | Shown when there are no items. |
| `endMessage` | `ReactNode` | | Shown after the last page. |
| `rootMargin` | `string` | `"200px"` | How early to load. |
| `as` | `"div" \| "ul" \| "ol"` | `"div"` | Element wrapping the items. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ list, footer }` | | Classes for the items wrapper and the footer (spinner / error / end message). |
