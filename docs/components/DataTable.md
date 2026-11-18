# DataTable

Table with typed columns, controlled sorting, row selection and pagination, plus loading, empty and error states. It fetches nothing: your app owns the data and passes it in.

```tsx
import { DataTable, type Column } from "corbel";
```

## Usage

```tsx
type User = { id: string; name: string; email: string; role: string; createdAt: string };

const columns: Column<User>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", cell: (u) => <a href={`mailto:${u.email}`}>{u.email}</a> },
  { key: "role", header: "Role", width: 120 },
  { key: "createdAt", header: "Joined", sortable: true, align: "right", cell: (u) => formatDate(u.createdAt) },
];

<DataTable columns={columns} rows={users} getRowKey={(u) => u.id} onRowClick={(u) => navigate(`/users/${u.id}`)} />
```

Without `cell`, a column shows `String(row[key])`.

### Worked example: a paginated API (RTK Query)

All state lives in the app; the table only reports clicks.

```tsx
// api.ts
export const usersApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (b) => ({
    getUsers: b.query<
      { items: User[]; total: number },
      { page: number; pageSize: number; sortBy?: string; order?: "asc" | "desc"; search?: string }
    >({ query: (params) => ({ url: "users", params }) }),
  }),
});

// UsersPage.tsx
import { DataTable, type RowKey, type SortState } from "corbel";

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<SortState | null>({ key: "createdAt", direction: "desc" });
  const [selected, setSelected] = useState<RowKey[]>([]);

  const { data, isLoading, isFetching, error, refetch } = usersApi.useGetUsersQuery({
    page,
    pageSize,
    sortBy: sort?.key,
    order: sort?.direction,
  });

  return (
    <DataTable
      columns={columns}
      rows={data?.items ?? []}
      getRowKey={(u) => u.id}
      loading={isFetching}               // spinner on first load, dimmed rows on refetch
      error={error ? "Couldn't load users." : undefined}
      onRetry={refetch}
      emptyTitle="No users yet"
      emptyAction={<Button onClick={openInvite}>Invite someone</Button>}
      sort={sort}
      onSortChange={(next) => {
        setSort(next);
        setPage(1);                       // a new order starts from page one
      }}
      selectedKeys={selected}
      onSelectionChange={setSelected}
      pagination={{
        page,
        pageSize,
        total: data?.total ?? 0,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
      classNames={{ scroll: "max-h-[70vh]" }} // scroll inside, header stays put
    />
  );
}
```

If your API returns `totalPages` but not `total`, pass `total: totalPages * pageSize`. If it wants `sortOrder: 1 | -1`, map it: `sortOrder: sort?.direction === "asc" ? 1 : -1`. Set a column's `sortKey` when the API field differs from the column `key`.

### Infinite scroll instead of pages

Accumulate pages in the app (e.g. an RTK Query infinite query or `merge`) and pass all rows:

```tsx
<DataTable
  {...props}
  rows={allRows}
  hasMore={hasNextPage}
  loadingMore={isFetchingNextPage}
  onLoadMore={fetchNextPage}
  classNames={{ scroll: "max-h-[360px]" }}
/>
```

### Mobile cards

`stackOnMobile` swaps the table for one card per row below `md`. The `primary` column (default: the first) is the card title; `hideOnMobile` drops low-value columns; `renderCardFooter` adds an action row.

```tsx
<DataTable {...props} stackOnMobile renderCardFooter={(u) => <RowActions user={u} />} />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Column<T>[]` | | See below. |
| `rows` | `T[]` | | The current page's rows (or all loaded rows, with infinite scroll). |
| `getRowKey` | `(row) => string \| number` | | Stable key per row; also the selection key. |
| `loading` | `boolean` | `false` | No rows: spinner. With rows: dims them and disables sorting. |
| `error` | `ReactNode` | | Error message, replaces the rows. `true` uses the default message. |
| `onRetry` | `() => void` | | Shows "Try again" in the error state. |
| `emptyTitle` | `ReactNode` | `"No data found"` | Empty state title. |
| `emptyMessage` | `ReactNode` | | Empty state message. |
| `emptyAction` | `ReactNode` | | Button under the empty message. |
| `sort` | `{ key, direction: "asc" \| "desc" } \| null` | | Current sort. |
| `onSortChange` | `(sort) => void` | | New column → asc; same column → flips. |
| `selectedKeys` | `(string \| number)[]` | `[]` | Selected rows. |
| `onSelectionChange` | `(keys) => void` | | Turns on the checkbox column. "Select all" acts on the visible rows and keeps keys from other pages. |
| `onRowClick` | `(row) => void` | | Makes rows clickable and focusable (Enter / Space). |
| `pagination` | `PaginationProps` (without `className`) | | Renders a [Pagination](Pagination.md) under the table. |
| `hasMore` / `loadingMore` / `onLoadMore` | | | Infinite scroll, as in [InfiniteList](InfiniteList.md). |
| `stickyHeader` | `boolean` | `true` | Header sticks while the `scroll` slot scrolls. Give that slot a max height. |
| `stackOnMobile` | `boolean` | `false` | Cards instead of the table below `md`. |
| `renderCardFooter` | `(row) => ReactNode` | | Bottom of each mobile card. |
| `caption` | `string` | | Accessible table name (visually hidden). |
| `className` | `string` | | Classes for the root box. |
| `classNames` | `{ scroll, table, thead, th, tbody, tr, td, card, pagination }` | | Classes for the other parts. |

### `Column<T>`

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Unique id. Without `cell`, the row property shown. |
| `header` | `ReactNode` | Header content. |
| `cell` | `(row, index) => ReactNode` | Cell content. |
| `sortable` | `boolean` | Header becomes a sort button. |
| `sortKey` | `string` | Key reported to `onSortChange`, if not `key`. |
| `width` / `minWidth` | `number \| string` | CSS sizes. |
| `align` | `"left" \| "center" \| "right"` | Header and cell alignment. |
| `className` / `headerClassName` | `string` | Classes for this column's cells / header. |
| `primary` / `hideOnMobile` | `boolean` | Mobile card layout (with `stackOnMobile`). |

## Styling

```tsx
<DataTable {...props} className="rounded-none border-x-0" classNames={{ th: "normal-case", td: "py-2" }} />
```
