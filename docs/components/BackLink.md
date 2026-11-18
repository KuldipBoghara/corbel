# BackLink

A "‹ Back" link: an `<a>` with `href`, otherwise a `<button>`.

```tsx
import { BackLink } from "corbel";
```

## Usage

```tsx
<BackLink href="/orders" label="All orders" />

{/* React Router */}
<BackLink onClick={() => navigate(-1)} />

{/* No href or onClick: calls window.history.back() */}
<BackLink />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | `"Back"` | Text after the chevron. |
| `href` | `string` | | Renders an `<a>`. |
| `onClick` | `() => void` | `window.history.back()` | Click handler. Renders a `<button>` when there is no `href`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Text and icon size. |
| `className` | `string` | | Classes for the link or button. |
