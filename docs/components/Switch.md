# Switch

On/off toggle for settings that apply immediately. A native checkbox with `role="switch"` underneath.

```tsx
import { Switch } from "corbel";
```

## Usage

```tsx
<Switch label="Email alerts" checked={alerts} onChange={setAlerts} />

<Switch
  label="Public profile"
  description="Anyone with the link can see it."
  checked={isPublic}
  onChange={setIsPublic}
  size="sm"
/>

// While a save is in flight
<Switch aria-label="Enabled" checked={enabled} onChange={save} loading={saving} />
```

## Props

All native `<input>` attributes are accepted (except `type`, `checked` and `onChange`, which are replaced), plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | | Required. Current state. |
| `onChange` | `(checked: boolean) => void` | | Called with the new state. |
| `label` | `ReactNode` | | Text next to the switch. Without it, pass `aria-label`. |
| `description` | `ReactNode` | | Smaller text under the label, linked with `aria-describedby`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Track size. |
| `loading` | `boolean` | `false` | Spinner in the thumb; toggling is blocked. |
| `disabled` | `boolean` | `false` | |
| `className` | `string` | | Classes for the root `<label>`. |
| `classNames` | `{ root, track, thumb, label, description }` | | Classes for the parts. |

## Styling

```tsx
// Status-coloured track when on
<Switch checked={on} onChange={setOn} classNames={{ track: on ? "bg-success" : undefined }} />
```
