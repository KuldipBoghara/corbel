# Pagination

"Showing 11–20 of 42", an optional rows-per-page selector, and page buttons with ellipses.

```tsx
import { Pagination, getPageRange } from "corbel";
```

## Usage

```tsx
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<Pagination
  page={page}
  pageSize={pageSize}
  total={data?.total ?? 0}
  onPageChange={setPage}
  onPageSizeChange={(size) => {
    setPageSize(size);
    setPage(1);
  }}
/>
```

Without `onPageSizeChange` the selector is hidden. Page buttons are hidden when everything fits on one page; the summary always shows.

`DataTable` renders one for you through its `pagination` prop.

### `getPageRange`

The page-number helper, for building your own pager:

```ts
getPageRange(5, 10);    // [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
getPageRange(3, 10);    // [1, 2, 3, 4, "ellipsis", 10]  (one skipped page shows, not "…")
getPageRange(10, 20, 2); // [1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | | Current page, 1-based. |
| `pageSize` | `number` | | Rows per page. |
| `total` | `number` | | Total rows across all pages. Page count is `ceil(total / pageSize)`. |
| `onPageChange` | `(page: number) => void` | | Called with the new page. |
| `onPageSizeChange` | `(size: number) => void` | | Shows the "Display N per page" selector. Reset `page` to 1 when it fires. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Selector choices. |
| `siblings` | `number` | `1` | Pages shown either side of the current one. |
| `className` | `string` | | Classes for the root `<nav>`. |
| `classNames` | `{ summary, pageSize, pages, button }` | | Classes for the other parts. |

## Styling

```tsx
<Pagination {...props} className="border-t-0 px-0" classNames={{ button: "rounded-full" }} />
```
