# MultiSelectList

Scrollable checkbox list for small sets where every option should stay visible.

```tsx
import { MultiSelectList } from "corbel";
```

Use it for a handful of departments, wards or roles. For long or server-paged sets, use [SearchSelectList](./SearchSelectList.md).

## Usage

```tsx
<MultiSelectList
  label="Departments"
  options={departments.map((d) => ({ value: d.id, label: d.name, description: d.code }))}
  value={departmentIds}
  onChange={setDepartmentIds}
  hint="Users see records from these departments."
/>

<MultiSelectList label="Wards" options={wards} value={[]} onChange={setWards} emptyMessage="No wards yet." disabled />
```

A **Clear (n)** button appears beside the label once something is selected. Hide it with `clearable={false}`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `MultiSelectOption<V>[]` | | `{ value, label, description?, disabled? }`. |
| `value` | `V[]` | | Selected values. |
| `onChange` | `(value: V[]) => void` | | |
| `emptyMessage` | `ReactNode` | `"Nothing to choose from."` | Shown when `options` is empty. |
| `clearable` | `boolean` | `true` | Shows "Clear (n)". |
| `disabled` | `boolean` | `false` | |
| `label`, `hint`, `error`, `required`, `optional` | | | See [FormField](./FormField.md). |
| `id` | `string` | | Id of the list. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, label, hint, error, list, item, clear }` | | Classes for the parts. |

## Styling

```tsx
<MultiSelectList classNames={{ list: "max-h-64" }} … />
```
