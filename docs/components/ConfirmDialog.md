# ConfirmDialog

Confirmation step for destructive or hard-to-reverse actions, built on [Modal](Modal.md).

```tsx
import { ConfirmDialog } from "corbel";
```

## Usage

```tsx
<ConfirmDialog
  open={!!toDelete}
  onClose={() => setToDelete(null)}
  tone="danger"
  title="Delete user?"
  message="This cannot be undone."
  confirmLabel="Delete"
  onConfirm={async () => {
    await deleteUser(toDelete.id);
    setToDelete(null);
  }}
/>
```

If `onConfirm` returns a promise, the confirm button shows a spinner and the dialog cannot be closed until the promise settles.
The dialog never closes itself: close it in `onConfirm` once the work succeeds, or leave it open to let the user retry.
For loading state you track elsewhere (e.g. an RTK mutation's `isLoading`), pass `loading`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | | Shows the dialog. |
| `onClose` | `() => void` | | Cancel, Escape, backdrop and × call this. |
| `onConfirm` | `() => void \| Promise<unknown>` | | Called by the confirm button. |
| `title` | `ReactNode` | `"Are you sure?"` | |
| `message` | `ReactNode` | | Text under the title. |
| `confirmLabel` | `ReactNode` | `"Confirm"` | |
| `cancelLabel` | `ReactNode` | `"Cancel"` | |
| `tone` | `"danger" \| "warning" \| "primary" \| "info" \| "success"` | `"warning"` | Icon and colour. `"danger"` makes the confirm button red. |
| `loading` | `boolean` | `false` | Spinner on confirm, and closing blocked. |
| `icon` | `ReactNode` | tone icon | Replaces the icon. `null` hides it. |
| `className` | `string` | | Classes for the panel. |
