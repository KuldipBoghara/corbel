# Alert

An inline message box for info, success, warning and error states, with optional title, action and dismiss button.

```tsx
import { Alert } from "corbel";
```

## Usage

```tsx
<Alert>Your trial ends in 3 days.</Alert>

<Alert tone="success" title="Profile saved" />

<Alert
  tone="error"
  title="Couldn't load orders"
  action={<Button size="sm" variant="outline" onClick={refetch}>Retry</Button>}
>
  Check your connection and try again.
</Alert>

{/* Dismissible: you own the visibility state */}
{showBanner && (
  <Alert tone="warning" onClose={() => setShowBanner(false)}>
    Scheduled maintenance tonight at 22:00.
  </Alert>
)}

{/* Custom icon, or none */}
<Alert tone="primary" icon={<Sparkles size={18} />}>New: bulk export.</Alert>
<Alert tone="neutral" icon={false}>Plain note.</Alert>
```

`error` and `warning` render with `role="alert"` (screen readers announce them immediately); the other tones use `role="status"`.
Pass `role` yourself to override.

## Props

All native `<div>` attributes are accepted (except `title`), plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "error" \| "info"` | `"info"` | Colour and default icon. |
| `title` | `ReactNode` | | Bold first line. |
| `children` | `ReactNode` | | Message body. |
| `icon` | `ReactNode \| false` | tone icon | Replaces the icon; `false` hides it. |
| `action` | `ReactNode` | | Shown at the end, e.g. a "Retry" button. |
| `onClose` | `() => void` | | Shows a × button that calls this. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ icon, title, content, action, close }` | | Classes for the parts. |

## Styling

```tsx
<Alert tone="info" className="rounded-none border-x-0" classNames={{ content: "text-xs" }}>
  Full-width banner.
</Alert>
```
