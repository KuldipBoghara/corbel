# Feedback

The three outcomes of loading data: `Spinner` while loading, `EmptyState` when there is nothing, `ErrorState` when it failed.
For page-sized loaders see [Loader](Loader.md); for full error pages see [ErrorPage](ErrorPage.md).

```tsx
import { Spinner, EmptyState, ErrorState } from "corbel";
```

## Usage

```tsx
<Spinner />
<Spinner size={32} label="Saving" />

<EmptyState
  title="No orders yet"
  message="Orders you create will show up here."
  icon={<ShoppingCart size={22} />}
  action={<Button onClick={create}>New order</Button>}
/>

<ErrorState message={error.message} onRetry={refetch} />
<ErrorState title="You're offline" offline onRetry={refetch} />
```

## Props

### `Spinner`

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `number` | `20` | Pixel size. |
| `label` | `string` | | Accessible label (`role="status"`). Omit when next to visible text. |
| `className` | `string` | | Classes for the icon. Colour is `text-primary`. |

### `EmptyState`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | `"Nothing here yet"` | |
| `message` | `ReactNode` | | Text under the title. |
| `icon` | `ReactNode` | inbox icon | |
| `action` | `ReactNode` | | Button or link under the message. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, icon, title, message, action }` | | Classes for the parts. |

### `ErrorState`

Same as `EmptyState` without `action`, with `role="alert"`, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | `"Something went wrong"` | |
| `onRetry` | `() => void` | | Shows a retry button. |
| `retryLabel` | `ReactNode` | `"Try again"` | |
| `offline` | `boolean` | `false` | Shows the offline icon instead of the alert icon. |

## Styling

```tsx
<EmptyState className="py-6" classNames={{ icon: "bg-primary-50 text-primary" }} />
```
