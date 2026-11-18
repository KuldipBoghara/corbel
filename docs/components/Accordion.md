# Accordion

A stack of collapsible sections, such as an FAQ. It can be controlled or uncontrolled, and can open one item or several at once.

```tsx
import { Accordion } from "corbel";
```

## Usage

```tsx
<Accordion items={faqs.map((f) => ({ id: f.id, title: f.question, content: f.answer }))} />

{/* Several open at once, first one open initially */}
<Accordion items={items} multiple defaultValue={["shipping"]} />

{/* Controlled */}
const [open, setOpen] = useState<string[]>([]);
<Accordion items={items} value={open} onChange={setOpen} />
```

In single mode, opening an item closes the others, and clicking the open item closes it.
Each header is a `<button>` with `aria-expanded` and `aria-controls`. Its panel is a `role="region"` labelled by the header.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ id: string; title: ReactNode; content: ReactNode; disabled?: boolean }[]` | | The sections. |
| `multiple` | `boolean` | `false` | Allows more than one open item. |
| `value` | `string[]` | | Open ids (controlled). |
| `defaultValue` | `string[]` | `[]` | Initially open ids (uncontrolled). |
| `onChange` | `(value: string[]) => void` | | Called with the new open ids. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, item, trigger, icon, content }` | | Classes for the parts. |
