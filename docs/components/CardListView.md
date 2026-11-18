# CardListView

Card-per-row listing for simple records, with infinite scroll, expandable rows, row actions and optional drag-to-reorder. Uses the same data props as `DataTable`.

```tsx
import { CardListView } from "corbel";
```

## Usage

```tsx
<CardListView
  rows={departments}
  getRowKey={(d) => d.id}
  renderCode={(d) => d.code}
  renderTitle={(d) => d.name}
  renderMeta={(d) => `${d.memberCount} members`}
  renderBadge={(d) => <Badge tone={d.active ? "success" : "neutral"}>{d.active ? "Active" : "Inactive"}</Badge>}
  rowClassName={(d) => (d.active ? undefined : "opacity-60")}
  actions={[
    { key: "edit", label: "Edit", icon: <Pencil size={18} />, onClick: openEdit },
    {
      key: "status",
      label: (d) => (d.active ? "Deactivate" : "Activate"),
      icon: (d) => (d.active ? <PowerOff size={18} /> : <Power size={18} />),
      tone: (d) => (d.active ? "error" : "success"),
      onClick: toggleStatus,
    },
  ]}
  loading={isLoading}
  error={isError && "Couldn't load departments."}
  onRetry={refetch}
  hasMore={hasNextPage}
  loadingMore={isFetchingNextPage}
  onLoadMore={fetchNextPage}
  className="max-h-[560px]"
/>
```

### Expandable rows

```tsx
<CardListView {...props} renderExpanded={(d) => <SubTaskList departmentId={d.id} />} />
```

Each row gets a chevron button (`aria-expanded`); clicking anywhere on the header also toggles. Several rows can be open at once. Action buttons don't toggle the row.

### Reordering

```tsx
const [move] = useMoveDepartmentMutation();

<CardListView {...props} onReorder={({ id, toIndex }) => move({ id, position: toIndex }).unwrap()} />
```

Each row gets a drag grip (mouse, touch or keyboard; see [SortableList](SortableList.md)). The dropped order stays on screen until new `rows` arrive; if the promise rejects it rolls back. Indexes are positions in `rows`, so only pass `onReorder` while the list shows every row in stored order, not while it is filtered.

### Filling a flex page

```tsx
<div className="flex h-full flex-col">
  <Toolbar />
  <CardListView {...props} className="min-h-0 flex-1" />
</div>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `T[]` | | All rows loaded so far. |
| `getRowKey` | `(row) => string \| number` | | Stable key per row. |
| `loading` | `boolean` | `false` | First load: spinner while there are no rows. |
| `error` | `ReactNode` | | Error message; `true` uses the default. |
| `onRetry` | `() => void` | | Retry button handler. |
| `emptyTitle` | `ReactNode` | `"No data found"` | Empty state title. |
| `emptyMessage` | `ReactNode` | | Empty state message. |
| `emptyAction` | `ReactNode` | | Button under the empty message. |
| `hasMore` / `loadingMore` / `onLoadMore` | | | Infinite scroll, as in [InfiniteList](InfiniteList.md). |
| `renderTitle` | `(row) => ReactNode` | | Headline. Required. |
| `renderCode` | `(row) => ReactNode` | | Small monospace identifier before the title. |
| `renderMeta` | `(row) => ReactNode` | | Supporting line. A string truncates; a node may wrap. |
| `renderBadge` | `(row) => ReactNode` | | Shown before the actions. |
| `renderExpanded` | `(row) => ReactNode` | | Makes rows expandable. |
| `actions` | `CardAction<T>[]` | `[]` | Icon buttons: `{ key, label, icon, tone?, onClick, hidden?, disabled? }`. `label`, `icon` and `tone` may be functions of the row. |
| `onReorder` | `({ id, fromIndex, toIndex }) => void \| Promise` | | Enables drag-to-reorder. |
| `variant` | `"card" \| "flush"` | `"card"` | Separate cards, or divided rows inside your own container. |
| `rowClassName` | `(row) => string` | | Extra classes per row. |
| `className` | `string` | | Classes for the scroll container (add a height). |
| `classNames` | `{ list, row, header, code, title, meta, badge, actions, expanded }` | | Classes for the other parts. |

Action tones: `"neutral" | "primary" | "success" | "warning" | "error" | "info"`.
