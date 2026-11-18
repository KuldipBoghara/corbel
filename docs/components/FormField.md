# FormField & Label

The label, hint and error layout every corbel form control uses, available for your own controls.

```tsx
import { FormField, Label } from "corbel";
```

## FormField

Renders the label, your control, then the error (or the hint), and gives you the ids to wire up so screen readers announce them.

```tsx
<FormField label="Brand colour" hint="Used on invoices." error={errors.colour} required>
  {({ id, describedBy, invalid }) => (
    <input
      id={id}
      type="color"
      aria-describedby={describedBy}
      aria-invalid={invalid}
      value={colour}
      onChange={(e) => setColour(e.target.value)}
    />
  )}
</FormField>
```

| Prop | Type | Description |
|---|---|---|
| `label` | `ReactNode` | Text above the control. |
| `hint` | `ReactNode` | Helper text, hidden while `error` is set. |
| `error` | `ReactNode` | Error message. |
| `required` | `boolean` | Red asterisk after the label. |
| `optional` | `boolean` | "(optional)" after the label. |
| `id` | `string` | Id for the control. Generated if omitted. |
| `children` | `({ id, describedBy, invalid }) => ReactNode` | Renders the control. |
| `className` | `string` | Classes for the wrapper. |
| `classNames` | `{ root, label, hint, error }` | Classes for each part. |

`label`, `hint`, `error`, `required` and `optional` together are exported as the `FieldProps` type, and every form control accepts them.

## Label

A form label on its own, with the same required/optional markers.

```tsx
<Label htmlFor="notes" optional>Notes</Label>
```

Accepts all `<label>` attributes, plus `required` and `optional`.
