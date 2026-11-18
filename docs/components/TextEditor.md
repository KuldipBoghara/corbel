# TextEditor

Rich-text (HTML) editor built on Tiptap 3: bold, italic, headings 1–3, alignment, bullet and numbered lists, links, images, undo/redo.

## Install

The editor lives at its own entry point, `corbel/editor`, so apps that don't use it never load Tiptap. Its Tiptap packages are optional peer dependencies; install them in your app:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-text-align
```

(`@tiptap/extension-link` comes with `@tiptap/starter-kit` 3.)

```tsx
import { TextEditor } from "corbel/editor";
```

## Usage

```tsx
const [html, setHtml] = useState(record.description ?? "");

<TextEditor label="Description" required value={html} onChange={setHtml} error={errors.description} />

// Images: uploaded through your API, then inserted by URL
<TextEditor
  value={html}
  onChange={setHtml}
  onImageUpload={async (file) => {
    const body = new FormData();
    body.append("file", file);
    const { data } = await axios.post("/api/files", body);
    return data.url;
  }}
  onError={toast.error}
/>

// Read-only view of saved HTML
<TextEditor value={record.description} disabled minHeight={0} />

// Heavy form: report changes 500 ms after the last keystroke
<TextEditor value={html} onChange={setHtml} debounceMs={500} />
```

An empty editor reports `""`, not `"<p></p>"`, so `required` checks work as expected. Changing `value` from outside (form reset, loaded record) replaces the content.

The **Insert image** button only appears when `onImageUpload` is set. Without it there is no way to add images from the toolbar (pasted HTML with `<img>` still renders).

### With react-hook-form

```tsx
<Controller
  name="description"
  control={control}
  render={({ field, fieldState }) => (
    <TextEditor label="Description" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
  )}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `""` | HTML. |
| `onChange` | `(html: string) => void` | | New HTML; `""` when empty. |
| `placeholder` | `string` | `"Start writing…"` | Shown while empty. |
| `label`, `hint`, `error`, `required`, `optional` | | | See `FieldProps`. |
| `disabled` | `boolean` | `false` | Read-only: hides the toolbar and mutes the text. |
| `minHeight` | `number \| string` | `220` | Minimum height of the writing area. |
| `debounceMs` | `number` | `0` | Delay before `onChange` after typing stops. A pending change is still sent on unmount. |
| `onImageUpload` | `(file: File) => Promise<string>` | | Uploads a picked image and resolves with its URL. Enables the image button. |
| `onError` | `(message: string) => void` | | Image upload failures. |
| `id` | `string` | | Id of the editable area. |
| `className` | `string` | | Classes for the bordered editor box. |
| `classNames` | `{ root, label, hint, error, toolbar, content }` | | Classes for the other parts. |

## Styling

Content typography (headings, lists, links, images, placeholder) comes from Tailwind classes on the `content` slot, so no `@tailwindcss/typography` plugin is needed. Override with `classNames.content`, e.g. `"[&_h1]:text-3xl"`.
