# ErrorPage

Full-page error screen for 403, 404, 500, 503, offline, timeout and unexpected errors, plus helpers to pick the right one.

```tsx
import { ErrorPage, getErrorVariant, useOnlineStatus } from "corbel";
```

## Usage

```tsx
// Router catch-all
<Route path="*" element={<ErrorPage variant="not-found" homeHref="/" />} />

// From a failed RTK Query / fetch request
const { data, error, refetch } = useGetOrderQuery(id);
if (error) return <ErrorPage variant={getErrorVariant(error)} onRetry={refetch} />;

// Override anything
<ErrorPage
  variant="forbidden"
  title="Admins only"
  message="Ask your workspace owner for access."
  icon={<img src={lockArt} alt="" />}
  onHome={() => navigate("/")}
/>

// Your own buttons
<ErrorPage variant="server-error" actions={<Button onClick={() => location.reload()}>Reload</Button>} />
```

With `variant="offline"` and `onRetry`, the retry also runs automatically when the browser comes back online.
Nothing reloads the page on its own: pass `onRetry={() => location.reload()}` if that's what you want.

### `getErrorVariant(error)`

| Error | Variant |
|---|---|
| `{ status: 403 }` | `"forbidden"` |
| `{ status: 404 }` | `"content-not-found"` |
| `{ status: 500 }` | `"server-error"` |
| `{ status: 503 }` | `"service-unavailable"` |
| `{ status: "FETCH_ERROR" }` | `"offline"` |
| `{ status: "TIMEOUT_ERROR" }`, `{ name: "AbortError" }` | `"timeout"` |
| anything else | `"general"` |

### `useOnlineStatus()`

Returns `true` while the browser is online and re-renders when that changes (always `true` during SSR).

```tsx
const online = useOnlineStatus();
{!online && <Banner tone="warning">You're offline. Changes will sync when you reconnect.</Banner>}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"forbidden" \| "not-found" \| "content-not-found" \| "server-error" \| "service-unavailable" \| "offline" \| "timeout" \| "general"` | `"general"` | Picks the default code, title, message and icon. |
| `code` | `ReactNode` | per variant (`"404"` …) | Small text above the title. `null` hides it. |
| `title` | `ReactNode` | per variant | |
| `message` | `ReactNode` | per variant | |
| `icon` | `ReactNode` | per variant | Icon or illustration. `null` hides it. |
| `actions` | `ReactNode` | | Replaces the retry / home buttons. |
| `onRetry` | `() => void` | | Shows a retry button. |
| `retryLabel` | `ReactNode` | `"Try again"` | |
| `homeHref` | `string` | | Shows a home link (`<a>`). |
| `onHome` | `() => void` | | Shows a home button. Ignored when `homeHref` is set. |
| `homeLabel` | `ReactNode` | `"Go back home"` | |
| `className` | `string` | | Classes for the root (`min-h-[60vh]` by default; use `min-h-screen` outside a layout). |
| `classNames` | `{ root, icon, code, title, message, actions }` | | Classes for the parts. |

## Styling

```tsx
<ErrorPage variant="not-found" className="min-h-screen bg-bg-main" classNames={{ icon: "size-32 text-text-muted" }} />
```
