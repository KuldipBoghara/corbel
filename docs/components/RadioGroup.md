# RadioGroup

A list of radio buttons for one choice out of several, with a shared label, hint and error.

```tsx
import { RadioGroup } from "corbel";
```

## Usage

```tsx
<RadioGroup
  label="Plan"
  value={plan}
  onChange={setPlan}
  options={[
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro", description: "$9 per user / month" },
    { value: "enterprise", label: "Enterprise", disabled: true },
  ]}
/>

{/* In a row */}
<RadioGroup
  label="Priority"
  orientation="horizontal"
  value={priority}
  onChange={setPriority}
  options={[
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ]}
  error={errors.priority}
  required
/>
```

The radios are native `<input type="radio">` elements, so the browser handles the keyboard
(Tab into the group, arrow keys to move and select) and they submit with a plain `<form>` under `name`.

`value` is typed from the options: with `options` declared `as const`, `onChange` receives the union of their values.

**RadioGroup or SegmentedControl?** Both pick one value.
[SegmentedControl](SegmentedControl.md) is a compact row of buttons for 2–4 short options.
RadioGroup suits longer labels, descriptions, or more options.

### With react-hook-form

```tsx
<Controller
  control={control}
  name="plan"
  render={({ field, fieldState }) => (
    <RadioGroup label="Plan" options={plans} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
  )}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ value, label, description?, disabled? }[]` | | The choices. |
| `value` | `T \| "" \| null` | | The chosen value; `""` or `null` for none. |
| `onChange` | `(value: T) => void` | | Called with the picked option's value. |
| `name` | `string` | generated | Native `name` shared by the radios. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Stack or row (the row wraps). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Radio size: 16, 18 or 24 px. |
| `disabled` | `boolean` | `false` | Disables every option. |
| `label`, `hint`, `error`, `required`, `optional` | | | See [FormField](FormField.md). |
| `id` | `string` | generated | Id of the radiogroup element. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, label, hint, error, group, option, radio, optionLabel, optionDescription }` | | Classes for the parts. |

## Styling

```tsx
{/* Options as bordered cards */}
<RadioGroup
  options={plans}
  value={plan}
  onChange={setPlan}
  classNames={{
    option: "rounded-xl border border-border-default p-3 has-checked:border-primary has-checked:bg-primary-50",
  }}
/>
```
