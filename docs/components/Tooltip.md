# Tooltip

A short hint shown when the user hovers or focuses an element.

```tsx
import { Tooltip } from "corbel";
```

## Usage

```tsx
<Tooltip content="Delete row">
  <button aria-label="Delete row" onClick={remove}>
    <Trash2 size={16} />
  </button>
</Tooltip>

<Tooltip content="Only admins can export" placement="bottom">
  <Button disabled>Export</Button>
</Tooltip>

<Tooltip content={`Last synced ${timeAgo}`} placement="right" delay={0}>
  <span className="text-text-muted">Synced</span>
</Tooltip>
```

- Opens after `delay` ms of hover, or immediately on keyboard focus. Escape, mouse leave, blur and page scroll close it.
- Rendered in a portal, so it is never clipped by an `overflow-hidden` table or modal.
- `top` and `bottom` flip to the other side when there is no room, and the bubble always stays on screen.
- While open, the child gets `aria-describedby` pointing at the tooltip (any `aria-describedby` it already has is kept).
- Works on disabled buttons too, because the events are handled by a wrapping `<span>`.

A tooltip is a *description*. Icon-only buttons still need their own `aria-label`.
Don't put links or buttons inside a tooltip: it closes when the pointer leaves the trigger.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | | Bubble text. Nothing shows while it is empty. |
| `children` | `ReactNode` | | The element being described. |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Preferred side. |
| `delay` | `number` | `300` | Hover delay in ms. |
| `disabled` | `boolean` | `false` | Never show. |
| `container` | `HTMLElement \| null` | `document.body` | Portal target. |
| `className` | `string` | | Classes for the bubble. |

## Styling

The bubble uses `bg-text-primary text-bg-card`, so it inverts with your theme.

```tsx
<Tooltip content="Saved" className="bg-success text-white">…</Tooltip>
```
