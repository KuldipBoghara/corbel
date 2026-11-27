# Skeleton

A grey, pulsing placeholder shown while content loads. Size and shape it with `className`.

```tsx
import { Skeleton } from "corbel";
```

## Usage

```tsx
<Skeleton />                          {/* block, full width, 96px tall */}
<Skeleton className="h-40 w-64" />
<Skeleton variant="circle" />         {/* 40px avatar */}
<Skeleton variant="circle" className="size-16" />
<Skeleton variant="text" />           {/* one line */}
<Skeleton variant="text" lines={3} /> {/* paragraph, last line shorter */}
```

### Building a placeholder for a card

Compose skeletons in the same layout as the real content:

```tsx
function UserCardSkeleton() {
  return (
    <Card className="flex items-center gap-3">
      <Skeleton variant="circle" />
      <div className="flex-1">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="mt-2 w-1/2" />
      </div>
    </Card>
  );
}

<div aria-busy={isLoading}>
  {isLoading ? Array.from({ length: 4 }, (_, i) => <UserCardSkeleton key={i} />) : users.map(…)}
</div>
```

Skeletons are `aria-hidden`. Mark the loading region with `aria-busy` so screen readers know content is coming.
The pulse stops for users who prefer reduced motion.

## Props

All native `<div>` attributes are accepted, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"text" \| "rect" \| "circle"` | `"rect"` | Line of text, block, or circle. |
| `lines` | `number` | `1` | For `text`: number of lines; the last is shorter. |
| `className` | `string` | | Size and shape. With `lines`, styles the wrapper. |

## Styling

The colour is `bg-border-default`. Change it per use with `className="bg-bg-main"`.
