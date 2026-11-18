# Dropdown

Select built on react-select: single or multiple, searchable, creatable, sync or async, with option thumbnails and descriptions.

```tsx
import { Dropdown } from "corbel";
```

It takes and returns **plain values** (ids), not react-select option objects. The menu is portalled to `document.body` with fixed positioning, so it is never clipped inside a Modal or a scrolling panel.

## Usage

```tsx
const statuses = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed", description: "No further work" },
];

<Dropdown label="Status" options={statuses} value={status} onChange={setStatus} required />

// Multiple: value is an array
<Dropdown label="Tags" multiple options={tags} value={tagIds} onChange={setTagIds} />

// Let the user add values that are not in the list (string values)
<Dropdown
  label="Category"
  creatable
  options={categories}
  value={category}
  onChange={setCategory}
  onCreateOption={(name) => createCategory(name)}
  isValidNewOption={(text) => text.length <= 40}
/>

// Thumbnails and descriptions
<Dropdown
  label="Assignee"
  options={users.map((u) => ({ value: u.id, label: u.name, image: u.avatarUrl, description: u.email }))}
  value={assigneeId}
  onChange={setAssigneeId}
/>

// Groups
<Dropdown
  label="Notes"
  multiple
  options={[
    { label: "English", options: englishNotes },
    { label: "Hindi", options: hindiNotes },
  ]}
  value={noteIds}
  onChange={setNoteIds}
/>

// Toolbar filter with no visible label
<Dropdown aria-label="Filter by status" size="sm" options={statuses} value={filter} onChange={setFilter} />
```

`onChange` also receives the option object(s), so you can keep the label without a lookup:

```tsx
<Dropdown options={shifts} value={null} onChange={(id, option) => addShift(id, option?.label)} />
```

The value type is generic: `<Dropdown<number> options={[{ value: 1, label: "One" }]} … />`. Clearing a single dropdown sends `null`.

### Async options

Pass `loadOptions(search) => Promise<Option[]>` instead of `options`. It is called with `""` on mount, then with the search text (debounced 300 ms) as the user types. Results are cached per search.

```tsx
<Dropdown
  label="User"
  loadOptions={async (search) => {
    const res = await api.users({ search, limit: 20 });
    return res.data.map((u) => ({ value: u.id, label: u.fullName }));
  }}
  // the current value is not in the first page? pass its option so it has a label
  options={selected ? [{ value: selected.id, label: selected.name }] : []}
  value={userId}
  onChange={setUserId}
/>
```

In async mode, `options` (if any) are shown before the user types and are used to label the current value. Every loaded option is remembered too. To reload when a filter changes, give the Dropdown a new `key`. Add `creatable` to allow new values here as well.

To search server-side while keeping your own option state, use `onSearchChange` with `options` and `loading`.

### With form libraries

```tsx
// react-hook-form
<Controller
  control={control}
  name="status"
  render={({ field, fieldState }) => (
    <Dropdown
      label="Status"
      options={statuses}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `(DropdownOption<V> \| DropdownGroup<V>)[]` | `[]` | Options or `{ label, options }` groups. |
| `value` | `V \| null` (`V[]` with `multiple`) | | Selected value(s). |
| `onChange` | `(value, option) => void` | | `(V \| null, option \| null)`, or `(V[], options[])` with `multiple`. |
| `multiple` | `boolean` | `false` | Pick several values. |
| `loadOptions` | `(search: string) => Promise<DropdownOption<V>[]>` | | Turns on async mode. |
| `creatable` | `boolean` | `false` | Offer "Add …" for typed text. The new value is the trimmed text. |
| `onCreateOption` | `(input: string) => void` | | Called when a value is created, before `onChange`. |
| `isValidNewOption` | `(input: string) => boolean` | | Extra check before "Add …" is offered. Empty text and existing labels are never offered. |
| `formatCreateLabel` | `(input: string) => ReactNode` | `Add "…"` | Text of the create row. |
| `onSearchChange` | `(search: string) => void` | | Called on each keystroke in the search box. |
| `searchable` | `boolean` | `true` | |
| `clearable` | `boolean` | `true` | Shows the clear (×) button. |
| `disabled` | `boolean` | `false` | |
| `loading` | `boolean` | `false` | Loading indicator (sync mode). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height. |
| `placeholder` | `string` | `"Select…"` | |
| `noOptionsMessage` | `string` | `"No options"` | |
| `maxMenuHeight` | `number` | `240` | In px. |
| `label`, `hint`, `error`, `required`, `optional` | | | See [FormField](./FormField.md). |
| `aria-label` | `string` | | Accessible name when there is no `label`. |
| `name` | `string` | | Hidden input name, for native form submission. |
| `id` | `string` | | Id of the search input. |
| `onBlur` | `() => void` | | |
| `container` | `HTMLElement` | `document.body` | Where the menu is portalled. |
| `className` | `string` | | Classes for the control (the visible box). |
| `classNames` | `{ root, label, hint, error, control, menu, option }` | | Classes for the other parts. |

`DropdownOption<V>`: `{ value: V; label: string; description?: ReactNode; image?: string; icon?: ReactNode; disabled?: boolean }`. `image` is a URL shown as a round thumbnail; `description` is a second line in the menu.

## Styling

```tsx
<Dropdown className="rounded-full" classNames={{ menu: "rounded-lg", option: "py-1.5" }} … />
```

Every inner element also carries a stable `corbel-select__*` class (react-select's `classNamePrefix`), e.g. `.corbel-select__multi-value`, for anything the slots do not reach.
