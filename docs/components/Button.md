# Button

Button with variants, sizes, icons and a loading state.

```tsx
import { Button } from "corbel";
```

## Usage

```tsx
<Button onClick={save}>Save</Button>

<Button variant="outline" startIcon={<Plus size={16} />}>Add item</Button>

<Button variant="danger" loading={isDeleting} onClick={remove}>Delete</Button>

<Button type="submit" fullWidth size="lg">Sign in</Button>
```

### Variants

| Variant | Use for |
|---|---|
| `primary` | The main action on a screen. |
| `secondary` | Supporting actions, tinted with the primary colour. |
| `outline` | Neutral actions (Cancel, Back, Export). |
| `ghost` | Low-emphasis actions in toolbars and table rows. |
| `danger` | Destructive actions. Pair with [ConfirmDialog](ConfirmDialog.md). |

### Navigating

A `<button>` inside an `<a>` is invalid HTML, so navigate from the click handler:

```tsx
<Button onClick={() => navigate("/orders/new")}>New order</Button>
```

## Props

All native `<button>` attributes are accepted (`type` defaults to `"button"`, not `"submit"`), plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost" \| "danger"` | `"primary"` | Visual style. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height, padding and text size. |
| `loading` | `boolean` | `false` | Shows a spinner in place of `startIcon` and disables the button. |
| `fullWidth` | `boolean` | `false` | Stretches to the container's width. |
| `startIcon` | `ReactNode` | | Icon before the label. |
| `endIcon` | `ReactNode` | | Icon after the label. |
| `className` | `string` | | Merged last, so it overrides the defaults. |

The ref is forwarded to the `<button>`.

## Styling

```tsx
<Button className="bg-success hover:bg-success/90">Approve</Button>
<Button variant="ghost" className="size-9 px-0" aria-label="Edit"><Pencil size={16} /></Button>
```
