# TimePicker

Time field with hour, minute and AM/PM columns. The value is always 24-hour `HH:mm`.

```tsx
import { TimePicker } from "corbel";
```

## Usage

```tsx
<TimePicker label="Start time" value={start} onChange={setStart} required />

// 24-hour display, quarter-hour steps
<TimePicker label="Shift ends" value={end} onChange={setEnd} hourCycle={24} step={15} />
```

- `hourCycle` only changes what is shown (`02:30 PM` vs `14:30`); `onChange` always receives `HH:mm` in 24-hour form.
- Picking a column updates the value straight away; the panel stays open until an outside click or Escape. An empty value starts from `12:00 AM` (`00:00`).
- The panel is portalled, so it is not clipped inside a Modal.

The helpers `parseTime`, `formatTime(value, hourCycle)` and `to24Hour(hour12, period)` are exported too.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | | `HH:mm` (24-hour), or `""`. |
| `onChange` | `(value: string) => void` | | Receives `HH:mm` (24-hour). |
| `hourCycle` | `12 \| 24` | `12` | Display form. |
| `step` | `number` | `1` | Minutes between choices. |
| `placeholder` | `string` | `"Select time"` | |
| `disabled` | `boolean` | `false` | |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Field height. |
| `label`, `hint`, `error`, `required`, `optional` | | | See [FormField](./FormField.md). |
| `id` | `string` | | Id of the trigger button. |
| `name` | `string` | | Renders a hidden input with the value. |
| `container` | `HTMLElement` | `document.body` | Where the panel is portalled. |
| `className` | `string` | | Classes for the trigger button. |
| `classNames` | `{ root, label, hint, error, popover }` | | Classes for the other parts. |

The ref is forwarded to the trigger button.

## Styling

```tsx
<TimePicker className="bg-bg-main" classNames={{ popover: "w-64" }} … />
```
