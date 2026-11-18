# Input

Text input with label, hint, error, icons and a password reveal toggle.

```tsx
import { Input } from "corbel";
```

## Usage

```tsx
<Input label="Full name" placeholder="Jane Doe" required />

<Input label="Email" type="email" error={errors.email} hint="We never share it." />

<Input placeholder="Search…" startIcon={<Search size={16} />} size="sm" />

<Input label="Password" type="password" />
```

### With form libraries

The ref is forwarded to the native `<input>`:

```tsx
// react-hook-form
<Input label="Email" error={errors.email?.message} {...register("email")} />

// Formik
<Input label="Email" error={touched.email && errors.email} {...getFieldProps("email")} />
```

## Props

All native `<input>` attributes are accepted, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | | Text above the field. |
| `hint` | `ReactNode` | | Helper text under the field. Hidden while `error` is set. |
| `error` | `ReactNode` | | Error message. Also marks the field invalid. |
| `required` | `boolean` | `false` | Red asterisk after the label, and the native `required`. |
| `optional` | `boolean` | `false` | "(optional)" after the label. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height and padding. |
| `startIcon` | `ReactNode` | | Icon inside the field, on the left. |
| `endIcon` | `ReactNode` | | Icon inside the field, on the right. Ignored for passwords. |
| `className` | `string` | | Classes for the `<input>` element. |
| `classNames` | `{ root, label, hint, error }` | | Classes for the other parts. |

## Styling

```tsx
<Input className="rounded-full bg-bg-main" classNames={{ label: "uppercase tracking-wide" }} />
```
