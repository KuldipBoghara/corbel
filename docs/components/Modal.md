# Modal

Accessible dialog with a title bar, scrollable body and footer, rendered in a portal.

```tsx
import { Modal } from "corbel";
```

## Usage

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Edit user"
  description="Changes apply immediately."
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button loading={saving} onClick={save}>Save</Button>
    </>
  }
  busy={saving}
>
  <Input label="Name" autoFocus />
</Modal>

// Own header, no default title bar or × button
<Modal open={open} onClose={close} header={<Banner />} aria-label="Welcome" flushBody size="lg">
  …
</Modal>

// Must be dismissed with a button
<Modal open={open} onClose={close} title="Terms" closeOnBackdrop={false}>…</Modal>
```

Behaviour:
- Escape, the backdrop and the × button call `onClose`. `busy` blocks all three.
- Page scroll is locked while open.
- Focus moves into the dialog on open (an `autoFocus` child wins), Tab stays inside, and focus returns to the trigger on close.
- A nested modal handles Escape first and does not close its parent.
- No `#__modal_container__` element is needed: it renders into `document.body`, or `container`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | | Shows the dialog. |
| `onClose` | `() => void` | | Called on Escape, backdrop click and the × button. |
| `title` | `ReactNode` | | Heading of the title bar. Labels the dialog. |
| `description` | `ReactNode` | | Text under the title. Describes the dialog. |
| `header` | `ReactNode` | | Replaces the title bar. Hides the × button unless `showClose`. |
| `children` | `ReactNode` | | Body content. Scrolls past 70vh. |
| `footer` | `ReactNode` | | Action row, right-aligned (stacked on mobile). |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Max width: 28rem, 42rem, 56rem, 72rem, or the full viewport. |
| `busy` | `boolean` | `false` | Blocks closing, e.g. while saving. |
| `closeOnBackdrop` | `boolean` | `true` | Backdrop click closes. |
| `showClose` | `boolean` | `true` (`false` with `header`) | Shows the × button. |
| `flushBody` | `boolean` | `false` | Removes the body padding. |
| `container` | `HTMLElement \| null` | `document.body` | Portal target. |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` | |
| `aria-label` | `string` | | Accessible name when there is no `title`. |
| `aria-labelledby` / `aria-describedby` | `string` | | Override the automatic wiring. |
| `className` | `string` | | Classes for the panel. |
| `classNames` | `{ overlay, panel, header, title, description, body, footer, close }` | | Classes for the other parts. |

## Styling

```tsx
<Modal className="max-w-[992px] rounded-lg" classNames={{ overlay: "bg-black/80", body: "p-0" }} … />
```
