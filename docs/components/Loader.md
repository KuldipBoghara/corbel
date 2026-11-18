# Loader

Loading indicators: `PageLoader` for a whole page, `InlineLoader` for a section, `LoadingDots` for small inline spots.
For a bare spinner icon, use [`Spinner`](Feedback.md).

```tsx
import { PageLoader, InlineLoader, LoadingDots } from "corbel";
```

## Usage

```tsx
if (isLoading) return <PageLoader />;

<PageLoader label="Loading report…" className="min-h-screen" />

{isFetching ? <InlineLoader label="Loading orders…" /> : <Table rows={rows} />}

<InlineLoader label={null} className="py-4" />   {/* spinner only */}

<p className="flex items-center gap-1 text-text-muted">
  Alex is typing <LoadingDots size={16} />
</p>
```

## Props

### `PageLoader`, `InlineLoader`

Both have `role="status"`, so screen readers announce them.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | `"Loading…"` | Visible text. `null` shows only the spinner (screen readers still hear "Loading"). |
| `className` | `string` | | Classes for the root. `PageLoader` is `min-h-[60vh]` by default. |

### `LoadingDots`

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `number` | `24` | Pixel size. |
| `label` | `string` | | Accessible label. Omit when next to visible text. |
| `className` | `string` | | Classes for the `<svg>`. Colour follows the text colour (`text-primary`). |
