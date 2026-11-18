# SearchSelectList

Fixed-height, searchable list of checkboxes (or radios) that loads more rows as it is scrolled.

```tsx
import { SearchSelectList } from "corbel";
```

It fetches nothing. You pass `items` plus `loading` / `hasMore` / `onLoadMore`, and get selected keys back. Wrap it around your API hook for each kind of record (see [Wrapping an API hook](#wrapping-an-api-hook)).

## Usage

```tsx
// Local list, filtered by label as the user types
<SearchSelectList
  label="Departments"
  items={departments}
  getKey={(d) => d.id}
  getLabel={(d) => d.name}
  value={departmentIds}
  onChange={(ids) => setDepartmentIds(ids)}
/>

// Single choice: radios, with a "None" row to clear
<SearchSelectList
  multiple={false}
  label="Supervisor"
  items={supervisors}
  getKey={(s) => s.id}
  getLabel={(s) => s.name}
  value={supervisorId}
  onChange={(id) => setSupervisorId(id)}
  noneLabel="— None —"
/>

// Custom rows: avatar + subtitle, and a muted trailing column
<SearchSelectList
  label="Users"
  items={users}
  getKey={(u) => u.id}
  getLabel={(u) => u.fullName}
  renderItem={(u) => (
    <span className="flex items-center gap-2">
      <img src={u.avatarUrl} alt="" className="size-6 rounded-full" />
      <span className="min-w-0">
        <span className="block truncate">{u.fullName}</span>
        <span className="block truncate text-xs text-text-muted">{u.email}</span>
      </span>
    </span>
  )}
  renderTrailing={(u) => u.employeeId}
  isItemDisabled={(u) => !u.active}
  value={userIds}
  onChange={setUserIds}
/>
```

`onChange` receives the keys and the matching items: `(keys, items)` in multiple mode, `(key | null, item | null)` in single mode. The items come from `items` and `selectedItems`, so keep them if you need labels later.

### Selections that are not on screen

Selection is held as **keys**, so a record stays picked when a search hides it or it has not been paged in yet. Pass the records you already know as `selectedItems` and they are pinned to the top of the list with their label:

```tsx
<SearchSelectList selectedItems={alreadyAssigned} value={alreadyAssigned.map((w) => w.id)} … />
```

### Server-side search and paging

- **Search.** Set `onSearchChange` and the list stops filtering locally. It calls `onSearchChange` once the user stops typing (`searchDelay`, 300 ms by default). `search` makes the text controlled if you need to reset it.
- **Paging.** Set `hasMore` and `onLoadMore`. When the bottom of the box scrolls into view (IntersectionObserver), `onLoadMore` is called. It is not called again while `loading` is true.
- **Accumulating.** If your hook returns one page at a time, pass `page` too: page 1 replaces the rows and later pages are appended (rows already shown are skipped). If you already hold the full list (an RTK Query infinite query, a `merge`d endpoint), leave `page` out.
- **Errors.** `loadError` shows an error with a **Try again** button that calls `onRetry`. Use `error` for a validation message under the field.

### Wrapping an API hook

Each app keeps tiny named wrappers that bind the list to one endpoint. This is the Omega `WorkerSelectList` rebuilt on corbel with an RTK Query hook:

```tsx
import { useCallback, useState } from "react";
import { SearchSelectList, type ListKey } from "corbel";
import { useGetAllWorkersQuery } from "../redux/api/workerApi";

export function WorkerSelectList({ value, onChange, label = "Assigned workers", error }: {
  value: ListKey[];
  onChange: (ids: ListKey[]) => void;
  label?: string;
  error?: string;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isFetching, isError, refetch } = useGetAllWorkersQuery({ page, limit: 20, searchTerm: search || undefined });

  const onSearchChange = useCallback((term: string) => {
    setSearch(term);
    setPage(1); // a new search starts from page 1
  }, []);

  return (
    <SearchSelectList
      label={label}
      error={error}
      items={data?.workers ?? []}
      getKey={(w) => w.id}
      getLabel={(w) => w.fullName}
      renderTrailing={(w) => w.employeeId}
      value={value}
      onChange={onChange}
      onSearchChange={onSearchChange}
      page={page}
      hasMore={page < (data?.pagination?.totalPages ?? 1)}
      onLoadMore={() => setPage((p) => p + 1)}
      loading={isFetching}
      loadError={isError && "Could not load workers"}
      onRetry={refetch}
      searchPlaceholder="Search workers…"
      emptyMessage="No workers found"
    />
  );
}
```

Variations from the old wrappers map to props:

- Wrapper reports `{ id, name }` objects (`SecondaryWorkerSelectList`): use the second `onChange` argument, `onChange={(ids, rows) => onChange(rows.map((w) => ({ id: w.id, name: w.fullName })))}`, and pass `selectedItems` built from `value`.
- Two pickers over one source must not overlap: `excludeKeys={otherPicker.map((w) => w.id)}`.
- Extra query args or `skip`: pass them to your hook; the list does not care.
- Count only the picks this endpoint offers (old `countOnlyListed`): `showCount={false}` and put your own count in `label`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | | Rows to show (with `page`: that page's rows). |
| `getKey` | `(item: T) => string \| number` | | Unique key. |
| `getLabel` | `(item: T) => string` | | Row text, and what local search matches. |
| `renderItem` | `(item: T, { selected }) => ReactNode` | | Replaces the row content. |
| `renderTrailing` | `(item: T) => ReactNode` | | Muted content on the right. |
| `isItemDisabled` | `(item: T) => boolean` | | |
| `multiple` | `boolean` | `true` | `false` for radios and a single key. |
| `value` | `ListKey[]` (`ListKey \| null` single) | | Selected key(s). |
| `onChange` | `(keys, items) => void` | | `(key \| null, item \| null)` in single mode. |
| `noneLabel` | `ReactNode \| null` | `"None"` | Single mode: the clearing radio. `null` hides it. |
| `selectedItems` | `T[]` | `[]` | Known records for selected keys, pinned on top when not in `items`. |
| `excludeKeys` | `ListKey[]` | `[]` | Keys to hide. |
| `search` | `string` | | Controlled search text. |
| `onSearchChange` | `(search: string) => void` | | Debounced; turns off local filtering. |
| `searchDelay` | `number` | `300` | Debounce in ms. |
| `searchPlaceholder` | `string` | `"Search…"` | |
| `page` | `number` | | Accumulate pages (see above). |
| `loading` | `boolean` | `false` | Spinner (full box when empty, bottom row otherwise). |
| `hasMore` | `boolean` | `false` | More rows exist. |
| `onLoadMore` | `() => void` | | Called when the bottom scrolls into view. |
| `loadError` | `ReactNode` | | Loading failed; a string replaces the message. |
| `onRetry` | `() => void` | | **Try again** button. |
| `emptyMessage` | `ReactNode` | `"No results"` | |
| `showCount` | `boolean` | `true` | "(n selected)" after the label. |
| `disabled` | `boolean` | `false` | |
| `height` | `number` | `200` | Scroll box height in px. |
| `label`, `hint`, `error`, `required`, `optional` | | | See [FormField](./FormField.md). |
| `id` | `string` | | Id of the search input. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, label, hint, error, search, list, item }` | | Classes for the parts. |

## Styling

```tsx
<SearchSelectList classNames={{ list: "bg-bg-main", item: "py-0.5" }} … />
```
