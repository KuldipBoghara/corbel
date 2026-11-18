# PhotoThumb

One photo thumbnail with loading and "unavailable" states. FileUploader uses it for its grid.

```tsx
import { PhotoThumb } from "corbel";
```

## Usage

```tsx
<PhotoThumb src={photo.url} alt="Display error" />

<PhotoThumb src={photo.url} className="size-32 rounded-xl" openable={false} />
```

### Private files

The component never fetches. When an image is only served with an auth header, fetch it yourself and pass an object URL:

```tsx
function StoredPhoto({ fileId }: { fileId: string }) {
  const { data: objectUrl, isLoading, isError } = useGetFileBlobQuery(fileId);
  return <PhotoThumb src={objectUrl} loading={isLoading} error={isError} />;
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| null` | | Image URL. Missing or failing to load shows the placeholder. |
| `alt` | `string` | `"Photo"` | Alt text. |
| `loading` | `boolean` | `false` | Shows a spinner. |
| `error` | `boolean` | `false` | Shows the "unavailable" placeholder. |
| `openable` | `boolean` | `true` | Wraps the image in a link that opens it in a new tab. |
| `className` | `string` | | Classes for the image (default `size-20 rounded-lg border`). |
