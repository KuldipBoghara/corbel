# Tabs

A horizontal row of tabs with an underline on the active one. Controlled, with full keyboard support.
For a vertical section rail, use [`SideTabs`](SideTabs.md). It takes the same items.

```tsx
import { Tabs } from "corbel";
```

## Usage

```tsx
type Section = "details" | "history" | "files";
const [tab, setTab] = useState<Section>("details");

<Tabs<Section>
  items={[
    { value: "details", label: "Details" },
    { value: "history", label: "History", count: 4 },
    { value: "files", label: "Files", icon: <Paperclip size={16} />, disabled: !canSeeFiles },
  ]}
  value={tab}
  onChange={setTab}
/>
```

### Linking panels

Pass `id` to wire up `aria-controls`, then give your panel the matching ids:

```tsx
<Tabs id="order" items={items} value={tab} onChange={setTab} />
<div role="tabpanel" id={`order-panel-${tab}`} aria-labelledby={`order-tab-${tab}`}>…</div>
```

### Keyboard

Only the active tab is in the Tab order. Arrow keys (Left/Right and Up/Down) move to the previous or next tab and select it. Home and End jump to the first or last tab. Disabled tabs are skipped.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TabItem<T>[]` | | `{ value, label, count?, icon?, disabled? }`. `value` is a `string` or `number`. |
| `value` | `T` | | The selected tab's value. |
| `onChange` | `(value: T) => void` | | Called with the newly selected value. |
| `id` | `string` | | Base for the tab ids (`{id}-tab-{value}`) and `aria-controls` (`{id}-panel-{value}`). |
| `aria-label` | `string` | `"Sections"` | Accessible name of the tab list. |
| `className` | `string` | | Classes for the tab list. |
| `classNames` | `{ root, tab, icon, count }` | | Classes for the parts. |

A `count` pill shows whenever `count` is not `undefined`, including `0`.
