# corbel

[![npm](https://img.shields.io/npm/v/corbel)](https://www.npmjs.com/package/corbel)
[![CI](https://github.com/KuldipBoghara/corbel/actions/workflows/ci.yml/badge.svg)](https://github.com/KuldipBoghara/corbel/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/corbel)](LICENSE)

React components styled with **Tailwind CSS v4**, themed entirely from your own `@theme` block.

- **Your theme, no provider.** Components use theme tokens (`bg-primary`, `text-text-secondary`, …). Set the token in your CSS and every component follows.
- **Override anything.** `className` is merged last with tailwind-merge, so `className="bg-success"` replaces the default instead of fighting it. Multi-part components also take `classNames`.
- **Data in, events out.** No component fetches data, uses a router or shows toasts. Pass arrays and callbacks, and wire your own API layer (RTK Query, React Query, fetch …).
- **TypeScript and JavaScript.** Written in TypeScript and shipped as plain ES modules with type definitions. TypeScript apps get full types, JavaScript apps just import.
- **Accessible.** Labelled fields, `aria-invalid`/`aria-describedby` errors, focus-trapped dialogs, keyboard-operable tabs, lists and pickers.
- React 18 and 19 · Next.js App Router ready (`"use client"`) · tree-shakeable.

## Installation

```bash
npm install corbel
```

Peer requirements: `react` 18 or 19, `react-dom`, and `tailwindcss` v4.

## Setup

Add one line to your main CSS file, after Tailwind:

```css
@import "tailwindcss";
@import "corbel/styles.css";
```

That import tells Tailwind to scan corbel's components and registers the default tokens. There's no config file and no provider.

## Usage

```tsx
import { Button, Input, Modal } from "corbel";

export function InviteUser() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite</Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a teammate"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={send}>Send invite</Button>
          </>
        }
      >
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Modal>
    </>
  );
}
```

## Theming

Declare any token in your own `@theme` and it replaces corbel's default:

```css
@import "tailwindcss";
@import "corbel/styles.css";

@theme {
  --color-primary: #1b4f98;
  --color-primary-dark: #163f7a;
  --color-error: #e11d48;
}
```

To restyle one component, pass classes:

```tsx
<Button className="rounded-full">Pill button</Button>
<Modal classNames={{ header: "bg-primary text-primary-contrast" }} />
```

See **[docs/theming.md](docs/theming.md)** for the full token list, dark mode, and how to map an existing theme.

## Components

| Category | Components |
|---|---|
| **Inputs** | [Button](docs/components/Button.md) · [Input](docs/components/Input.md) · [TextArea](docs/components/TextArea.md) · [Checkbox](docs/components/Checkbox.md) · [Switch](docs/components/Switch.md) · [RadioGroup](docs/components/RadioGroup.md) · [OtpInput](docs/components/OtpInput.md) · [SearchBar](docs/components/SearchBar.md) · [SegmentedControl](docs/components/SegmentedControl.md) · [FileUploader](docs/components/FileUploader.md) · [FormField & Label](docs/components/FormField.md) |
| **Pickers & selection** | [Dropdown](docs/components/Dropdown.md) · [DatePicker](docs/components/DatePicker.md) · [TimePicker](docs/components/TimePicker.md) · [SearchSelectList](docs/components/SearchSelectList.md) · [MultiSelectList](docs/components/MultiSelectList.md) |
| **Data display** | [Card](docs/components/Card.md) · [Avatar](docs/components/Avatar.md) · [Badge & StatusBadge](docs/components/Badge.md) · [StatTile](docs/components/StatTile.md) · [Accordion](docs/components/Accordion.md) · [PhotoThumb](docs/components/PhotoThumb.md) |
| **Tables & lists** | [DataTable](docs/components/DataTable.md) · [Pagination](docs/components/Pagination.md) · [CardListView](docs/components/CardListView.md) · [InfiniteList](docs/components/InfiniteList.md) · [SortableList](docs/components/SortableList.md) |
| **Navigation** | [PageHeader](docs/components/PageHeader.md) · [BackLink](docs/components/BackLink.md) · [Tabs](docs/components/Tabs.md) · [SideTabs](docs/components/SideTabs.md) |
| **Overlays** | [Modal](docs/components/Modal.md) · [Drawer](docs/components/Drawer.md) · [ConfirmDialog](docs/components/ConfirmDialog.md) · [Menu](docs/components/Menu.md) · [Tooltip](docs/components/Tooltip.md) |
| **Feedback** | [Alert](docs/components/Alert.md) · [Spinner, EmptyState, ErrorState](docs/components/Feedback.md) · [PageLoader, InlineLoader, LoadingDots](docs/components/Loader.md) · [Skeleton](docs/components/Skeleton.md) · [ErrorPage](docs/components/ErrorPage.md) · [ErrorBoundary](docs/components/ErrorBoundary.md) |
| **Rich text** | [TextEditor](docs/components/TextEditor.md) (separate entry: `corbel/editor`) |

### Rich-text editor

The editor is built on Tiptap and lives in its own entry point, so apps that don't use it never install Tiptap:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-text-align
```

```tsx
import { TextEditor } from "corbel/editor";
```

## Connecting your data

Components never call APIs, so they work with any data layer. A typical RTK Query page:

```tsx
const [page, setPage] = useState(1);
const { data, isFetching, error, refetch } = useGetOrdersQuery({ page, limit: 20 });

<DataTable
  columns={columns}
  rows={data?.items ?? []}
  getRowKey={(o) => o.id}
  loading={isFetching}
  error={error ? "Couldn't load orders." : undefined}
  onRetry={refetch}
  pagination={{ page, pageSize: 20, total: data?.total ?? 0, onPageChange: setPage }}
/>
```

Uploads work the same way: [FileUploader](docs/components/FileUploader.md) calls your `onUpload(file, { onProgress, signal })` and stores whatever it returns.

## Forms

Field components forward refs and accept `label`, `hint`, `error`, `required` and `optional`, so they work with react-hook-form, Formik or plain state:

```tsx
<Input label="Email" error={errors.email?.message} {...register("email")} />
```

## Migrating from in-app components

Moving an app's own `components/common` folder onto corbel? See **[docs/migration.md](docs/migration.md)** for every renamed prop.

## Versioning

corbel follows [semantic versioning](https://semver.org): patch for fixes, minor for new components and props, major for any breaking change.
Every release is listed in [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, component conventions and the release process.

## License

[MIT](LICENSE)
