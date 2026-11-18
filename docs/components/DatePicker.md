# DatePicker

Date field: type `DD/MM/YYYY` or pick from a calendar. The value is always `YYYY-MM-DD`.

```tsx
import { DatePicker } from "corbel";
```

## Usage

```tsx
<DatePicker label="Due date" value={due} onChange={setDue} required />

// Only dates from today to the end of the year
<DatePicker label="Visit" value={visit} onChange={setVisit} min={toISODate(new Date())} max="2026-12-31" />

<DatePicker label="Born" value={dob} onChange={setDob} size="sm" error={errors.dob} />
```

- Typing accepts `DD/MM/YYYY`, `DD-MM-YYYY` and `DD.MM.YYYY`. The text is committed on blur or Enter. Impossible dates (31/02) and dates outside `min`/`max` revert to the last valid value. Emptying the text clears the value (`onChange("")`).
- The calendar is portalled with fixed positioning, flips above the field when there is no room below, and follows scrolling. It closes on outside click and Escape.
- Days outside `min`/`max` are disabled, and so is the footer's **Today** button when today is out of range. **Clear** empties the value.
- Keyboard: ArrowDown in the field opens the calendar and focuses the selected day (or today); Tab moves through the days; Escape returns to the field.

### With form libraries

The ref is forwarded to the text input. Set `name` to also render a hidden input carrying the `YYYY-MM-DD` value for native form posts.

```tsx
<Controller
  control={control}
  name="due"
  render={({ field, fieldState }) => (
    <DatePicker label="Due" {...field} error={fieldState.error?.message} />
  )}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | | `YYYY-MM-DD`, or `""`. |
| `onChange` | `(value: string) => void` | | Receives `YYYY-MM-DD`, or `""` when cleared. |
| `min` | `string` | | Earliest selectable date, `YYYY-MM-DD`. |
| `max` | `string` | | Latest selectable date, `YYYY-MM-DD`. |
| `placeholder` | `string` | `"DD/MM/YYYY"` | |
| `disabled` | `boolean` | `false` | |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Field height. |
| `label`, `hint`, `error`, `required`, `optional` | | | See [FormField](./FormField.md). |
| `id` | `string` | | Id of the text input. |
| `name` | `string` | | Renders a hidden input with the value. |
| `onBlur` | `() => void` | | Called after the typed text is committed. |
| `container` | `HTMLElement` | `document.body` | Where the calendar is portalled. |
| `className` | `string` | | Classes for the field box. |
| `classNames` | `{ root, label, hint, error, popover }` | | Classes for the other parts. |

The helpers `parseISODate`, `parseTypedDate` and `toISODate` are exported too.

## Styling

```tsx
<DatePicker className="rounded-full" classNames={{ popover: "shadow-lg" }} … />
```
