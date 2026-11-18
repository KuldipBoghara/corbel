# FileUploader

File input with drag & drop, type/size/count checks, per-file upload progress, retry, remove and image previews. One component for a single file or many, shown as a dropzone, a button or an inline photo tile.

```tsx
import { FileUploader, type UploadHandler, type UploadedFile, type FileItem } from "corbel";
```

## Two modes

- **With `onUpload`**: each file is uploaded as soon as it is picked. While it uploads the component shows its progress (and an error with **Retry** if it fails). When `onUpload` resolves, the resolved `UploadedFile` is added to `value` through `onChange`.
- **Without `onUpload`**: no network at all. `onChange` receives the picked `File` objects (after validation), and you upload them yourself, typically on form submit.

`value` can mix both kinds: `File` objects you picked and `UploadedFile`s already stored on the record (`{ url, name?, size?, type?, id? }`). Use `item instanceof File` to tell them apart.

## Usage

```tsx
// Many files, uploaded right away
const [files, setFiles] = useState<FileItem[]>(record.attachments);

<FileUploader
  multiple
  label="Attachments"
  hint="PDF or images"
  accept="image/*,.pdf"
  maxSize={10 * 1024 * 1024}
  maxFiles={5}
  value={files}
  onChange={setFiles}
  onUpload={uploadToApi}
  onError={(message) => toast.error(message)}
  onUploadingChange={setUploading} // disable Submit while true
/>

// One file, kept in form state and sent with the form (no onUpload)
const [file, setFile] = useState<FileItem | null>(null);

<FileUploader label="Contract" variant="button" accept=".pdf" value={file} onChange={setFile} />
```

### Recipes (replacing the old app components)

```tsx
// Photo strip with a small "Add" tile and the phone's rear camera (was MedEquip PhotoUpload, variant "inline")
<FileUploader
  multiple
  variant="tile"
  display="grid"
  accept={["image/png", "image/jpeg", "image/webp", "image/heic"]}
  maxSize={8 * 1024 * 1024}
  maxFiles={5}
  capture="environment"
  label="Photos"
  optional
  value={photos}
  onChange={setPhotos}
  onUpload={uploadPhoto}
  onError={toast.error}
/>

// Same, as a full-width dropzone with thumbnails underneath (was PhotoUpload variant "dropzone")
<FileUploader multiple display="grid" accept="image/*" prompt="Click to attach a photo, or drop files here" … />

// A button and a list of chosen files, nothing uploaded yet (was Omega AttachmentPicker)
<FileUploader multiple variant="button" prompt="Add attachment" accept=".pdf,.jpg,.jpeg,.png" hint="Supported: PDF, JPG, JPEG, PNG" … />

// One document, uploaded by the caller (was MedEquip FilePicker)
<FileUploader variant="button" maxSize={25 * 1024 * 1024} value={file} onChange={setFile} onError={setFileError} error={fileError} />
```

### Writing `onUpload`

```ts
type UploadHandler = (
  file: File,
  ctx: { onProgress(pct: number): void; signal: AbortSignal },
) => Promise<UploadedFile>;
```

Call `ctx.onProgress(0–100)` as bytes go out, honour `ctx.signal` (it aborts when the user removes the file mid-upload or the component unmounts), and resolve with `{ url, name?, size?, type?, id? }`. To fail, throw — preferably an `Error` whose `message` is fit to show the user; it appears under the file and is passed to `onError` as `"<file name>: <message>"`.

**With XMLHttpRequest** (no dependencies, real progress):

```ts
const uploadToApi: UploadHandler = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 300) return reject(new Error(`Upload failed (${xhr.status})`));
      const { data } = JSON.parse(xhr.responseText);
      resolve({ id: data.id, url: data.url, name: data.originalName, size: data.size, type: data.mimeType });
    };
    xhr.onerror = () => reject(new Error("Network error"));
    signal.addEventListener("abort", () => xhr.abort());
    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
```

**With axios**:

```ts
const uploadToApi: UploadHandler = async (file, { onProgress, signal }) => {
  const body = new FormData();
  body.append("file", file);
  const { data } = await axios.post("/api/files", body, {
    signal,
    onUploadProgress: (e) => e.total && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
  return { id: data.id, url: data.url, name: data.fileName, type: data.fileType };
};
```

**With an RTK Query mutation** (the app's existing endpoint; progress works when its `baseQuery` is axios-based and forwards `onUploadProgress`):

```ts
const [uploadFile] = useUploadFileMutation();

const onUpload: UploadHandler = async (file, { onProgress, signal }) => {
  const formData = new FormData();
  formData.append("file", file);
  const request = uploadFile({
    formData,
    options: { onUploadProgress: (e) => e.total && onProgress(Math.round((e.loaded * 100) / e.total)) },
  });
  signal.addEventListener("abort", () => request.abort());
  try {
    const res = await request.unwrap();
    return { id: res.id, url: res.url, name: res.fileName, type: res.fileType };
  } catch (err) {
    // RTK rejects with { status, data }, not an Error: turn it into a readable message.
    throw new Error(getErrorMessage(err, "File upload failed"));
  }
};
```

### Deleting on the server

`onRemove(item)` runs after an item is removed from `value`. Return a promise; if it rejects, the item is put back and the error goes to `onError`:

```tsx
<FileUploader
  …
  onRemove={(item) => {
    if (!(item instanceof File) && item.id) return deleteFile(item.id).unwrap();
  }}
/>
```

### Private files

Grid thumbnails load `item.url` directly. When files are only served with an auth header, render the thumbnail yourself:

```tsx
<FileUploader … display="grid" renderPreview={(item) => <StoredPhoto id={(item as UploadedFile).id!} />} />

function StoredPhoto({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetFileBlobQuery(id);
  return <PhotoThumb src={data} loading={isLoading} error={isError} />;
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `multiple` | `boolean` | `false` | Many files: `value` is an array. |
| `value` | `FileItem \| null` / `FileItem[]` | | Current file(s). |
| `onChange` | `(value) => void` | | New file(s): after a pick (no `onUpload`), an upload, or a remove. |
| `onUpload` | `UploadHandler` | | Uploads each file as it is picked. Omit to get `File`s back. |
| `onRemove` | `(item) => void \| Promise` | | After an item is removed. A rejected promise puts it back. |
| `onError` | `(message: string) => void` | | Too large, wrong type, too many, upload or remove failed. |
| `onUploadingChange` | `(uploading: boolean) => void` | | True while any upload is in flight. |
| `accept` | `string \| string[]` | | `.ext`, `type/*` or MIME types, like the native attribute. Also enforced on drop. |
| `maxSize` | `number` | | Largest file, in bytes. |
| `maxFiles` | `number` | `Infinity` | Most files with `multiple`. Extra picks are dropped with an `onError`. |
| `capture` | `boolean \| "user" \| "environment"` | | Opens the camera on phones. |
| `variant` | `"dropzone" \| "button" \| "tile"` | `"dropzone"` | Look of the trigger. `"tile"` is meant for `display="grid"`. |
| `display` | `"list" \| "grid"` | `"list"` | Rows with name/size, or square thumbnails. |
| `prompt` | `ReactNode` | | Text inside the trigger. |
| `icon` | `ReactNode` | | Icon inside the trigger. |
| `renderPreview` | `(item) => ReactNode` | | Custom grid thumbnail for stored items. |
| `disabled` | `boolean` | `false` | Hides the trigger and remove buttons. |
| `label`, `hint`, `error`, `required`, `optional` | | | See `FieldProps`. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, label, hint, error, trigger, list, item }` | | Classes for the parts. |

The ref is forwarded to the hidden `<input type="file">`. The trigger is hidden once `value` plus in-flight uploads reach the limit (1 without `multiple`); remove a file to pick another.

Helpers `formatFileSize(bytes)` and `matchesAccept(file, accept)` are exported too.
