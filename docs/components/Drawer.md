# Drawer

A full-height panel that slides in from the side of the screen, for filters, record details or a mobile navigation menu.

```tsx
import { Drawer } from "corbel";
```

## Usage

```tsx
<Drawer
  open={filtersOpen}
  onClose={() => setFiltersOpen(false)}
  title="Filters"
  description="Narrow down the order list."
  footer={
    <>
      <Button variant="outline" onClick={reset}>Reset</Button>
      <Button onClick={apply}>Apply</Button>
    </>
  }
>
  <RadioGroup label="Status" options={statuses} value={status} onChange={setStatus} />
</Drawer>

{/* Mobile nav from the left, no padding around the links */}
<Drawer open={navOpen} onClose={closeNav} placement="left" size="sm" title="Menu" flushBody>
  <nav>…</nav>
</Drawer>

{/* Wide details panel */}
<Drawer open={!!selected} onClose={() => setSelected(null)} size="lg" title={selected?.name}>
  <OrderDetails order={selected} />
</Drawer>
```

Drawer is a [Modal](Modal.md) underneath, so it behaves the same way:
- Escape, the backdrop and the × button call `onClose`. `busy` blocks all three.
- Page scroll is locked while open.
- Focus moves in on open, Tab stays inside, and focus returns to the trigger on close.

The title bar and footer stay fixed; only the body scrolls. On screens narrower than the panel it takes the full width.
The slide animation is turned off for users who prefer reduced motion.

## Props

Every [Modal prop](Modal.md#props) except `size`, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `placement` | `"right" \| "left"` | `"right"` | Side it slides in from. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Panel width: 384, 448 or 672 px. |
| `className` | `string` | | Classes for the panel. |
| `classNames` | `{ overlay, panel, header, title, description, body, footer, close }` | | Classes for the parts. |

## Styling

```tsx
{/* Custom width */}
<Drawer className="max-w-[520px]" … />

{/* Rounded inner edge, floating off the screen edge */}
<Drawer className="inset-y-2 right-2 h-auto rounded-2xl" … />
```
