# Badge

A small pill label. `StatusBadge` picks the tone from a status string, so a status has one colour everywhere.

```tsx
import { Badge, StatusBadge } from "corbel";
```

## Usage

```tsx
<Badge>Draft</Badge>
<Badge tone="success" dot>Online</Badge>
<Badge tone="primary" size="sm">New</Badge>

<StatusBadge status="ACTIVE" />            {/* green "Active" */}
<StatusBadge status="IN_PROGRESS" dot />   {/* blue "In progress" */}

{/* Add or override mappings */}
<StatusBadge status={order.status} tones={{ SHIPPED: "info", PENDING: "neutral" }} />

{/* Custom label */}
<StatusBadge status={order.status} formatLabel={(s) => t(`status.${s}`)} />
<StatusBadge status="PENDING">Awaiting review</StatusBadge>
```

### Default status tones

Matching ignores case, and treats `_`, `-` and spaces as the same: `"in progress"` matches `IN_PROGRESS`.
Unknown statuses are `neutral`.

| Tone | Statuses |
|---|---|
| `success` | ACTIVE, APPROVED, COMPLETED, DONE, PAID, ALLOW |
| `warning` | PENDING, ON_HOLD, EXPIRED |
| `info` | IN_PROGRESS, PROCESSING |
| `primary` | OPEN |
| `neutral` | INACTIVE, DRAFT, CLOSED |
| `error` | REJECTED, SUSPENDED, CANCELLED, FAILED, DENY |

## Props

### Badge

All native `<span>` attributes are accepted, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "error" \| "info"` | `"neutral"` | Colour. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding and text size. |
| `dot` | `boolean` | `false` | Dot before the label. |
| `className` | `string` | | Classes for the pill. |

### StatusBadge

All `Badge` props, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` | `string` | | Status string to map. |
| `tones` | `Record<string, BadgeTone>` | | Extra or overriding mappings, merged over the defaults. |
| `tone` | `BadgeTone` | | Forces a tone, ignoring the mapping. |
| `formatLabel` | `(status: string) => ReactNode` | `"IN_PROGRESS"` → `"In progress"` | Builds the label. |
| `children` | `ReactNode` | | Label. Overrides `formatLabel`. |
