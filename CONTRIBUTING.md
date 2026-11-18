# Contributing to corbel

## Setup

```bash
npm install
npm run typecheck   # tsc, strict
npm test            # vitest + Testing Library
npm run build       # tsc → dist/ (one .js + .d.ts per source file)
```

To try your changes in a real app before publishing, run this from the app: `npm install ../path/to/corbel`.
Run `npm run build` in corbel after each change; the app picks up the new `dist/`.

## Component conventions

Every component follows these rules, so the library feels like one thing.

### Files and exports
- One component (plus its small sub-parts) per file: `src/components/Name.tsx`.
- **Named exports only**: `export function Name` or `export const Name = forwardRef(...)`. No default exports.
- Export the props type as `NameProps`, plus any public union types (`NameVariant`, `NameSize`).
- Add every public export to `src/index.ts`, in its category.
- The first line of every component file is `"use client";` (needed for Next.js App Router).
- Relative imports end in `.js`, e.g. `import { cn } from "../utils/cn.js"`. This is required by NodeNext resolution.

### Styling and theming
- Colours come **only** from theme tokens, never from Tailwind's palette (`slate-500`, `blue-600`, …):

  | Purpose | Classes |
  |---|---|
  | Brand | `bg-primary`, `text-primary`, `hover:bg-primary-dark`, `bg-primary-50/100/200`, `text-primary-contrast` (text on primary) |
  | Text | `text-text-primary`, `text-text-secondary`, `text-text-muted` |
  | Surfaces | `bg-bg-card` (cards, inputs, popovers), `bg-bg-main` (page, hover, disabled) |
  | Borders | `border-border-default`, `border-border-light` |
  | Status | `success`, `warning`, `error`, `info`. Use opacity for tints: `bg-error/10 text-error border-error/30` |

  Plain `white`/`black`, and `bg-black/50` for overlays, are fine.
- Radii use Tailwind's scale (`rounded-lg`, `rounded-xl`), which apps can retheme through `--radius-*`.
- Merge every class list with `cn()` from `src/utils/cn.ts`. The user's `className` always goes **last**.
- `className` styles the component's **main visible element**: the `<input>` of an Input, the panel of a Modal, the root of everything else.
  Components with several styled parts also take `classNames?: Partial<Record<NameSlot, string>>` and export the `NameSlot` union.
- Reuse `fieldBaseClass` / `fieldErrorClass` (from `Input.tsx`) for any text-like control, and `FormField` for label/hint/error layout.
- No CSS files and no inline `style` for colour. The only stylesheet is `src/styles.css`.

### Behaviour
- **No data fetching, no app state, no router, no toasts.** Components receive data through props and report back through callbacks:
  - Lists take `options` / `rows` / `items` arrays plus `loading`, `error`, `onRetry` props.
  - Async work is a callback that returns a promise: `loadOptions(search)`, `onUpload(file) => Promise<UploadedFile>`.
  - Navigation is `href` (renders `<a>`) or `onClick` (renders `<button>`). For React Router, pass `onClick={() => navigate(-1)}`, or use `renderLink`/`as` where a component documents it.
  - Errors the component itself hits (file too large, wrong type) go to an `onError(message)` callback, never to a toast.
- Form controls are **controlled** (`value` + `onChange(value)`) and forward their ref to the native element (`forwardRef`) where one exists.
- Shared prop names:

  | Prop | Meaning |
  |---|---|
  | `size` | `"sm" \| "md" \| "lg"` (default `"md"`) |
  | `variant` | visual style |
  | `tone` | status colour: `"neutral" \| "primary" \| "success" \| "warning" \| "error" \| "info"` |
  | `open` / `onClose` | overlays (not `isOpen`) |
  | `startIcon` / `endIcon` | icons before and after content |
  | `label`, `hint`, `error`, `required`, `optional` | form fields (see `FieldProps`) |
  | `loading`, `disabled` | |

- Overlays (Modal, popovers) render through `createPortal` into `document.body`, or into the `container` prop if given.
- Accessibility basics are not optional: labels linked to inputs, `aria-invalid`/`aria-describedby` for errors, `role="dialog"` with `aria-modal`, Escape to close, visible focus rings, keyboard operation.
- Icons come from `lucide-react` 1.x. Use current names (`LoaderCircle`, not `Loader2`; `CircleAlert`, not `AlertCircle`).

### Tests
Put tests next to the component as `Name.test.tsx`, using Testing Library (`screen`, `userEvent`).
Each component with real logic (state, keyboard handling, filtering, pagination maths, upload flow) gets tests for that logic. Purely presentational components don't need one.

### Docs
Each component gets `docs/components/Name.md`, following the shape of [`docs/components/Input.md`](docs/components/Input.md):
a one-line summary, import, usage examples, a props table, and the `classNames` slots if it has any.
Link it from the component list in `README.md`.

## Releasing

We use [Changesets](https://github.com/changesets/changesets) for versioning.

1. In your PR, run `npm run changeset`, pick the bump type, and describe the change for users. Commit the generated file.
   - **patch**: bug fix, no API change
   - **minor**: new component or new optional prop
   - **major**: a renamed or removed prop, a changed default, or a changed theme token
2. When the PR merges to `main`, the Release workflow opens a "Version Packages" PR that bumps `package.json` and writes `CHANGELOG.md`.
3. Merging that PR publishes to npm.
