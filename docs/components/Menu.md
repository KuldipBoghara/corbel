# Menu

A list of actions that opens from a trigger button, like the "⋯" menu on a table row.

```tsx
import { Menu } from "corbel";
```

## Usage

```tsx
<Menu
  trigger={
    <Button variant="ghost" size="sm" aria-label="Row actions">
      <Ellipsis size={16} />
    </Button>
  }
  items={[
    { label: "Edit", icon: <Pencil size={14} />, onSelect: () => openEdit(row) },
    { label: "Duplicate", icon: <Copy size={14} />, onSelect: () => duplicate(row.id) },
    { type: "separator" },
    { label: "Delete", icon: <Trash2 size={14} />, tone: "danger", onSelect: () => setConfirmId(row.id) },
  ]}
/>
```

### Conditional items

`false`, `null` and `undefined` entries are skipped:

```tsx
items={[
  { label: "View", onSelect: view },
  canEdit && { label: "Edit", onSelect: edit },
  isAdmin && { type: "separator" },
  isAdmin && { label: "Delete", tone: "danger", onSelect: remove },
]}
```

### Navigation

Items are buttons. Navigate from `onSelect`:

```tsx
{ label: "Open", onSelect: () => navigate(`/orders/${row.id}`) }
```

### In a DataTable

```tsx
const columns: Column<Order>[] = [
  // …
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (row) => <Menu trigger={<button aria-label="Actions"><Ellipsis size={16} /></button>} items={actionsFor(row)} />,
  },
];
```

## Behaviour

- Click (or Enter/Space/ArrowDown) on the trigger opens the menu and focuses the first item; ArrowUp opens it on the last.
- ArrowUp/ArrowDown move between items (skipping disabled ones, wrapping at the ends), Home/End jump to the ends.
- Enter or click runs `onSelect`, closes the menu and returns focus to the trigger.
- Escape closes and returns focus to the trigger, without closing a surrounding Modal. Tab or an outside click close it.
- The trigger gets `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`. The menu is labelled by the trigger unless you pass `aria-label`.
- Rendered in a portal and kept on screen: it opens below the trigger and flips above when there is no room.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactElement` | | The button that opens the menu. |
| `items` | `(MenuItem \| false \| null \| undefined)[]` | | Actions and separators, top to bottom. |
| `aria-label` | `string` | | Accessible name of the menu, if the trigger's text isn't right. |
| `container` | `HTMLElement \| null` | `document.body` | Portal target. |
| `className` | `string` | | Classes for the menu panel. |
| `classNames` | `{ menu, item, icon, separator }` | | Classes for the parts. |

### `MenuItem`

| Field | Type | Description |
|---|---|---|
| `label` | `ReactNode` | Item text. |
| `onSelect` | `() => void` | Runs when the item is chosen. |
| `icon` | `ReactNode` | Shown before the label. |
| `tone` | `"default" \| "danger"` | `danger` colours it red. |
| `disabled` | `boolean` | Can't be focused or chosen. |

A separator is `{ type: "separator" }`.

## Styling

```tsx
<Menu trigger={…} items={…} className="min-w-56" classNames={{ item: "py-2.5" }} />
```
