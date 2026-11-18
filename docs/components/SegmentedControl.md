# SegmentedControl

A short, mutually exclusive choice shown as a row of buttons, with an optional status colour per option.

```tsx
import { SegmentedControl } from "corbel";
```

## Usage

```tsx
type Usable = "yes" | "limited" | "no";

const [usable, setUsable] = useState<Usable | "">("");

<SegmentedControl
  label="Is the equipment usable?"
  required
  value={usable}
  onChange={setUsable}
  error={errors.usable}
  options={[
    { value: "yes", label: "Yes", tone: "success" },
    { value: "limited", label: "Limited", tone: "warning", hint: "Describe the limits below." },
    { value: "no", label: "No", tone: "error" },
  ]}
/>
```

`onChange` is typed with your option values, so `setUsable` fits directly. Use it for two to four options; longer lists belong in a dropdown.

### Keyboard

It is a `radiogroup` with one Tab stop. Arrow keys move to and select the next/previous option (wrapping, skipping disabled ones); Home and End jump to the ends.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `SegmentedOption<T>[]` | | Required. See below. |
| `value` | `T \| "" \| null` | | Required. `""` or `null` means nothing chosen. |
| `onChange` | `(value: T) => void` | | Required. |
| `disabled` | `boolean` | `false` | Disables every option. |
| `label` | `ReactNode` | | Text above the control (names the radiogroup). |
| `hint` | `ReactNode` | | Helper text under the control. The chosen option's `hint` replaces it. |
| `error` | `ReactNode` | | Error message. Also marks the group invalid. |
| `required` / `optional` | `boolean` | `false` | Label markers (`required` also sets `aria-required`). |
| `id` | `string` | | Id of the radiogroup. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, label, hint, error, group, option }` | | Classes for the parts; `option` applies to every button. |

### `SegmentedOption<T>`

| Field | Type | Description |
|---|---|---|
| `value` | `T` | |
| `label` | `ReactNode` | |
| `hint` | `ReactNode` | Shown under the control while this option is chosen. |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "error" \| "info"` | Colour while chosen. Default `"neutral"` (white, raised). |
| `disabled` | `boolean` | |

## Styling

```tsx
<SegmentedControl classNames={{ group: "w-auto", option: "px-5 py-1.5 text-xs" }} {...props} />
```
