# Checkbox

Checkbox with optional label, description and an indeterminate ("some selected") state.

```tsx
import { Checkbox } from "corbel";
```

## Usage

```tsx
<Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />

<Checkbox
  label="Email notifications"
  description="A daily digest of activity on your account."
  checked={notify}
  onChange={(e) => setNotify(e.target.checked)}
/>

// "Select all" header
<Checkbox
  aria-label="Select all rows"
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onChange={(e) => selectAll(e.target.checked)}
/>
```

### With form libraries

`onChange` is the native change event and the ref goes to the native `<input type="checkbox">`:

```tsx
<Checkbox label="I accept the terms" {...register("terms")} />
```

## Props

All native `<input>` attributes are accepted (except `type`), plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | | Text next to the box. |
| `description` | `ReactNode` | | Smaller text under the label, linked with `aria-describedby`. |
| `indeterminate` | `boolean` | `false` | Shows a dash and sets the native `indeterminate` flag (announced as "mixed"). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Box size: 16, 18 or 24 px. |
| `disabled` | `boolean` | `false` | |
| `className` | `string` | | Classes for the root `<label>`. |
| `classNames` | `{ root, box, label, description }` | | Classes for the parts. |

## Styling

```tsx
<Checkbox label="Compact" className="gap-1.5" classNames={{ label: "text-xs" }} />
```
