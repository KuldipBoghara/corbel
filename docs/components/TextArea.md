# TextArea

Multi-line text field with the same label, hint, error and focus styling as `Input`.

```tsx
import { TextArea } from "corbel";
```

## Usage

```tsx
<TextArea label="Notes" placeholder="Anything we should know?" optional />

<TextArea label="Reason" rows={5} required error={errors.reason} hint="Shown to the customer." />
```

### With form libraries

The ref is forwarded to the native `<textarea>`:

```tsx
<TextArea label="Notes" error={errors.notes?.message} {...register("notes")} />
```

## Props

All native `<textarea>` attributes are accepted, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | | Text above the field. |
| `hint` | `ReactNode` | | Helper text under the field. Hidden while `error` is set. |
| `error` | `ReactNode` | | Error message. Also marks the field invalid. |
| `required` | `boolean` | `false` | Red asterisk after the label, and the native `required`. |
| `optional` | `boolean` | `false` | "(optional)" after the label. |
| `rows` | `number` | `3` | Visible text lines. |
| `className` | `string` | | Classes for the `<textarea>` element. |
| `classNames` | `{ root, label, hint, error }` | | Classes for the other parts. |

## Styling

```tsx
<TextArea className="resize-none font-mono" classNames={{ root: "max-w-lg" }} />
```
