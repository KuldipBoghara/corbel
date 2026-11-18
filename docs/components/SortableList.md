# SortableList

Drag-to-reorder for a vertical list (dnd-kit), plus `useSortableOrder` to keep the dropped order on screen while the server saves it.

```tsx
import { SortableList, SortableItem, useSortableOrder } from "corbel";
```

## Usage

`SortableList` renders nothing of its own. Render your rows with `SortableItem`; it hands you the drag grip to place wherever your layout wants it.

```tsx
const [reorder] = useReorderStagesMutation();

const { orderedItems, keys, handleReorder } = useSortableOrder({
  items: stages,                 // server order
  getKey: (s) => s.id,
  onReorder: ({ id, toIndex }) => reorder({ id, position: toIndex }).unwrap(), // reject = roll back
  resetKey: stages,              // a fresh read drops the optimistic order
});

<SortableList items={keys} onReorder={handleReorder}>
  <ul className="flex flex-col gap-2">
    {orderedItems.map((stage) => (
      <SortableItem key={stage.id} id={stage.id} className="flex items-center gap-3 rounded-lg border border-border-default p-3">
        {(grip) => (
          <>
            {grip}
            <span>{stage.name}</span>
          </>
        )}
      </SortableItem>
    ))}
  </ul>
</SortableList>
```

### Keyboard

Rows move by their grip only (so buttons inside the row keep working). Tab to a grip, press **Space** to lift, **↑/↓** to move, **Space** to drop, **Escape** to cancel. dnd-kit announces each step to screen readers.

### Turning it off

`disabled` on `SortableList` (and on each `SortableItem`) renders the rows untouched and passes `null` as the grip, so you don't need to branch. Disable it while the list is filtered or searched: a position in a partial list means nothing to the server.

## `useSortableOrder`

Without it a dropped row springs back for the length of the request, which reads as a failed drag.

| Option | Type | Description |
|---|---|---|
| `items` | `T[]` | Rows in the server's order. |
| `getKey` | `(item) => string \| number` | Same ids given to `SortableList` / `SortableItem`. |
| `onReorder` | `(move) => void \| Promise` | Persists the move. **Reject** on failure to roll back. |
| `resetKey` | `unknown` | Change it when `items` is a fresh read to drop the override (e.g. pass `items`, if it is a stable reference like an RTK Query result). |

Returns `{ orderedItems, keys, handleReorder }`: render `orderedItems`, give `keys` to `SortableList`, and pass `handleReorder` as its `onReorder`. Rows that arrive after a drop are kept, after the reordered ones.

## Props

### SortableList

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `(string \| number)[]` | | Row ids in render order. |
| `onReorder` | `({ id, fromIndex, toIndex }) => void` | | Called on drop, zero-based. Not called when dropped in place. |
| `disabled` | `boolean` | `false` | Turns dragging off. |
| `children` | `ReactNode` | | Your list. |

### SortableItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| number` | | Must match the row's entry in `items`. |
| `as` | `"li" \| "div" \| "tr"` | `"li"` | Element rendered. |
| `disabled` | `boolean` | `false` | Plain row, `null` grip. |
| `className` | `string` | | Classes for the row element. |
| `handleClassName` | `string` | | Classes for the grip button. |
| `handleLabel` | `string` | `"Drag to reorder"` | Grip's accessible name. |
| `children` | `(grip: ReactNode) => ReactNode` | | Receives the grip. |
