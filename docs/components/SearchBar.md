# SearchBar

Search field with a search icon, a clear button and optional debounce.

```tsx
import { SearchBar } from "corbel";
```

## Usage

```tsx
<SearchBar value={query} onChange={setQuery} />

// Only call onChange 300 ms after the user stops typing (e.g. to drive an API query).
// The field itself still updates on every keystroke; the clear button is never delayed.
<SearchBar value={query} onChange={setQuery} debounceMs={300} placeholder="Search devices…" />

<SearchBar value={query} onChange={setQuery} classNames={{ root: "sm:max-w-xs" }} />
```

`onChange` receives the raw text. Trim it yourself if you need to.

## Props

All native `<input>` attributes are accepted (except `type`, `value`, `onChange`, `size`), plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | | Required. |
| `onChange` | `(value: string) => void` | | Required. |
| `debounceMs` | `number` | | Delay before `onChange` fires. Off when omitted. |
| `placeholder` | `string` | `"Search…"` | |
| `aria-label` | `string` | `"Search"` | Accessible name. |
| `disabled` | `boolean` | `false` | Also hides the clear button. |
| `className` | `string` | | Classes for the `<input>` element. |
| `classNames` | `{ root, icon, clear }` | | Classes for the wrapper, search icon and clear button. |

The ref is forwarded to the `<input>`.

## Styling

```tsx
<SearchBar value={q} onChange={setQ} className="h-8 rounded-full" classNames={{ root: "max-w-[250px]" }} />
```
