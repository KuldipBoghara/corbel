# Migrating from in-app components

corbel was built by merging two apps' `components/common` folders: **MedEquip** (TypeScript) and **Omega** (JavaScript).
This page lists everything that changed, so either app can move over one component at a time.

## Steps

1. `npm install corbel`
2. In your main CSS, add `@import "corbel/styles.css";` after `@import "tailwindcss";`.
3. Keep your `@theme` block. Omega's token names already match corbel's. MedEquip maps its tokens as shown in [theming.md](theming.md#migrating-an-existing-theme).
4. Replace imports one component at a time:
   ```diff
   - import Button from "@/components/common/buttons/Button";
   + import { Button } from "corbel";
   ```
   Everything is a named export.
5. Apply the prop changes below, then delete the old file once nothing imports it.
6. Keep app-specific wrappers in the app. Examples: `WorkerSelectList` (rebuild it as a few lines around [SearchSelectList](components/SearchSelectList.md#wrapping-an-api-hook)), `ReviewManagement`, `FAQManager`, `ReviewModal`.

## Changes that apply everywhere

| Before | After |
|---|---|
| `isOpen` | `open` |
| `beforeIcon` / `beforeTextIcon` | `startIcon` |
| `afterIcon` / `afterTextIcon` | `endIcon` |
| `isLoading` / `isFetching` / `progressPending` | `loading` (or `busy` on Modal) |
| `isDisabled` | `disabled` |
| `isRequired` | `required` |
| `containerClassName` | `classNames.root` |
| `labelClassName` / `labelClass` | `classNames.label` |
| tone `danger` | tone `error` |
| tones `slate` / `emerald` / `amber` / `rose` / `indigo` | `neutral` / `success` / `warning` / `error` / `primary` |
| react-router `Link` / `navigate` inside components | `href` or `onClick` props |
| `toast(...)` inside components | `onError(message)` callbacks; the app shows the toast |
| API hooks inside components | data props + callbacks (`items`, `loading`, `onLoadMore`, `onUpload` …) |

> **MedEquip: required asterisk.** MedEquip fields showed a red `*` on every labelled field unless `optional` was set.
> corbel shows it only with `required`. Add `required` to fields that should show it.

## Inputs

### Button
- **Omega:**
  - `variant="contained"` → `"primary"`, `variant="outlined"` → `"outline"`.
  - `name` → `children`. `beforeTextIcon` / `afterTextIcon` → `startIcon` / `endIcon`.
  - `loading` now shows a spinner instead of "loading...".
- **MedEquip:**
  - `beforeIcon` / `afterIcon` → `startIcon` / `endIcon`.
  - `variant="gradient"` was removed; use `className="bg-gradient-to-r from-… to-…"`.

### Input
- **MedEquip:**
  - `beforeIcon` → `startIcon`, `containerClassName` → `classNames.root`. `className` still styles the `<input>`.
  - Asterisk: see the note above.

### TextArea (MedEquip)
- `containerClassName` → `classNames.root`. The ref is now forwarded.

### Checkbox
- **MedEquip:**
  - `labelClassName` → `classNames.label`.
  - `checked` no longer defaults to `false`, so uncontrolled use and `register` work.
- **Omega:**
  - `id` is auto-generated (it was always `"customCheckbox"`).
  - Sizes changed from `xs|sm|md|lg` to `sm|md|lg` (16/18/24px). Old `xs` → `md`, old `sm` → `lg` keeps the same pixel sizes.
  - The label no longer truncates; pass `classNames={{ label: "truncate" }}` to keep it.

### Switch (Omega `Switch` + `ToggleSwitch`)
- **Switch:**
  - `isLoading` → `loading`.
  - The built-in "Enable"/"Disable" text is gone; use `label`.
- **ToggleSwitch:**
  - `isOn` → `checked`.
  - `handleToggle()` → `onChange(next)`, e.g. `onChange={setOn}`.
  - The on-colour is now primary. Keep green with `classNames={{ track: on ? "bg-success" : undefined }}`.

### OtpInput (Omega)
- `onOtpSubmit(otp)` (fired on every change) → controlled `value` + `onChange(value)`, plus `onComplete(value)` once the code is full.
- Focusing the first box on mount is now opt-in: `autoFocus`.

### SearchBar
- **MedEquip:**
  - `ariaLabel` → `aria-label`.
  - `className` → `classNames.root`, because `className` now styles the `<input>`.
  - The `sm:max-w-xs` cap is gone; add it via `classNames.root`.
- **Omega:**
  - `searchQuery` / `setSearchQuery` → `value` / `onChange`.
  - Debounce is opt-in: pass `debounceMs={1500}` for the old behaviour.
  - Width styles → `classNames.root`.
  - The value is no longer trimmed.

### SegmentedControl (MedEquip)
- Tones: `emerald` → `success`, `amber` → `warning`, `rose` → `error`.

### FileUploader
One component replaces MedEquip's `FilePicker` and `PhotoUpload` and Omega's `AttachmentPicker`, `SingleFileUploader` and `MultipleFileUploader`.
The upload call moves into your `onUpload(file, { onProgress, signal }) => Promise<{ url, id?, name?, size?, type? }>`.
To show a server message on failure, throw an `Error` with it (unwrap RTK errors first).

| Old component | corbel |
|---|---|
| MedEquip `FilePicker` | `<FileUploader variant="button" maxSize={…} value onChange />`. Same `File \| null` value; the "Change file" button is gone. |
| MedEquip `PhotoUpload` | `<FileUploader multiple display="grid" variant="tile" capture="environment" accept={[…]} maxFiles={5} />` |
| Omega `AttachmentPicker` | `<FileUploader multiple variant="button" prompt="Add attachment" accept=".pdf,.jpg,.jpeg,.png" />` |
| Omega `SingleFileUploader` / `MultipleFileUploader` | `<FileUploader />` / `<FileUploader multiple />` |

- **MedEquip PhotoUpload:**
  - `variant="inline"` → `variant="tile"`. `variant="dropzone"` → the default variant with `display="grid"`.
  - `max` → `maxFiles`. The `accepts` text → `hint`.
  - Values change from `string[]` ids to `UploadedFile[]`. Store `value.map(v => v.id)`.
  - `module` and `entityId` move into your `onUpload` closure.
  - Private-file previews: use `renderPreview={(item) => <StoredPhoto id={item.id} />}`, where `StoredPhoto` fetches the blob and renders [PhotoThumb](components/PhotoThumb.md).
- **MedEquip PhotoThumb:** `fileId` → `src` (+ `loading`, `error`). The blob fetch stays in the app.
- **Omega uploaders:**
  - Renamed props:
    - `allowedFileTypes` → `accept`
    - `maxFileSize` → `maxSize`
    - `displayType "row"|"grid"` → `display "list"|"grid"`
    - `topLabel` → `label`
    - `message` → `prompt`
    - `icons` → `icon`
    - `validationErrorMessage` → `error`
  - `onUploadStart` / `onUploadEnd` / `isFileUploading` → `onUploadingChange(bool)`.
  - `autodelete` + `useDeleteFileMutation` → `onRemove={(item) => deleteFile(item.id).unwrap()}`. A rejected promise restores the item.
  - The response `{ id, url, fileName, fileType }` maps to `{ id, url, name: fileName, type: fileType }`.
  - Files now upload one request per file. `/file/upload-multiple` is no longer used.
  - Saved items `{ fileName, size }` map to `{ name, url, size }`.
  - Uncontrolled modes (`defaultValue`, `onFilesUploaded`, `onTrashChange`) were removed; components are controlled.

## Pickers & selection

### Dropdown (also replaces Omega `AsyncDropdown` and `ThumbnailOption`)
- **Values:**
  - Values are plain: Omega passed `{ value, label }` objects in and out.
  - `onChange(value, option)`, or `onChange(values, options)` with `multiple`.
  - A cleared single value is `null` (MedEquip sent `""`).
- **Renamed props:**
  - `isMulti` → `multiple`, `isClearable` → `clearable`, `isSearchable` → `searchable`
  - `allowCustomValue` → `creatable`, `validateCustomeInput` → `isValidNewOption`
  - `onInputChange` → `onSearchChange`, `ariaLabel` → `aria-label`
  - `className` now styles the control box.
- **Options:** thumbnails use the option fields `image`, `icon` and `description`.
- **Async:**
  - `loadOptions(search, page) => { options, hasMore }` → `loadOptions(search) => Promise<Option[]>`.
  - Paged async loading isn't supported; use [SearchSelectList](components/SearchSelectList.md) for large paged sets.
  - `dependency` → change the Dropdown's `key`. `defaultOptions` → `options`.
- **Removed:** Omega's label capitalising and value slugifying for created options (transform it in `onCreateOption`), plus `width`, `style`, `theme` and `controlMinHeight` (use `className` / `size`).
- There is no ref. Use react-hook-form's `Controller`.

### DatePicker
- `containerClassName` → `classNames.root`. Omega `heightClass` → `size`.
- New: `min` and `max`.

### TimePicker (Omega `TimeSelection`)
- **Breaking value format:** values are 24-hour `"HH:mm"` (Omega stored `"09:00 PM"`). Convert stored values, e.g. `"09:00 PM"` → `"21:00"`.
- Display is set separately with `hourCycle={12 | 24}` (default 12).
- `isRequired` (which defaulted to true) → `required`.

### SearchSelectList
- **The app owns the query.** `useListQuery`, `selectRows`, `queryArgs` and `queryOptions` move into your wrapper ([example](components/SearchSelectList.md#wrapping-an-api-hook)).
- **Renamed props:**
  - `rows` → `items`, `getRowId` → `getKey`
  - `renderRowLabel` → `getLabel` / `renderItem`, `renderRowTrailing` → `renderTrailing`
  - `selectedIds` → `value`, `selectedRows` → `selectedItems`, `excludeIds` → `excludeKeys`
  - `isFetching` → `loading`
  - `isError` / `errorMessage` → `loadError` + `onRetry`
  - `totalPages` → `hasMore={page < totalPages}`
- `onChange(keys, items)`. `height` is a number.

### MultiSelectList (MedEquip)
- `selected` → `value`. Option `hint` → `description`.

## Data display

### Card (MedEquip)
- Unchanged. `CardHeader` now takes ReactNode `title` and `description`.

### Avatar (MedEquip)
- Same props. A broken image now falls back to initials instead of disappearing.

### Badge / StatusBadge (MedEquip `StatusBadge`)
- Tones: `danger` → `error`. `info` now uses the info colour.
- `label` → `children`.
- `status` is required on `StatusBadge`; use `<Badge>` when there's no status.
- Extend the status map with `tones={{ ARCHIVED: "neutral" }}`.
- `IN_PROGRESS` now displays as "In progress"; override with `formatLabel`.

### StatTile
- **MedEquip:**
  - Tones `slate` / `amber` / `rose` / `emerald` / `indigo` → `neutral` / `warning` / `error` / `success` / `primary`.
  - The figure is always the text colour; only the caption and tint take the tone.
- **Omega:**
  - `valueClass` → `classNames.value`.
  - Centre the content with `classNames={{ root: "text-center" }}`.
  - The caption now sits above the figure.

### Accordion (Omega `FAQView`)
- `faqs={[{ question, answer }]}` → `items={[{ id, title, content }]}`.
- Only one item opens at a time by default; pass `multiple` for the old behaviour.
- The built-in "Frequently Asked Questions" heading is gone.

## Tables & lists

### DataTable (MedEquip `DataTable`, Omega `CustomDataTable`)
- **MedEquip:**
  - Renamed props:
    - `rowKey` → `getRowKey`
    - `isLoading` / `isFetching` → `loading`
    - `error` + `errorMessage` → `error` (a ReactNode)
    - column `render` → `cell(row, index)`
  - `meta` + `onPageChange` + `onPageSizeChange` → `pagination={{ page, pageSize, total, onPageChange, onPageSizeChange }}`.
  - Mobile cards are opt-in with `stackOnMobile`. `hideOnCard` → `hideOnMobile`, `cardFooter` → `renderCardFooter`.
- **Omega:**
  - Data and paging:
    - `data={{ data, pagination }}` → `rows={data?.data ?? []}` with `total` inside `pagination`.
    - `tableState` / `setTableState` → `pagination` + `sort` / `onSortChange`. Reset to page 1 on sort yourself.
  - Sorting:
    - `sortField` / `sortOrder: 1 | -1` → `sort={{ key, direction: "asc" | "desc" }}`.
    - Column `sortField` → `sortKey`.
  - Renamed props:
    - `progressPending` → `loading`
    - `isError` + `error` → `error`, `refetch` → `onRetry`
    - `emtyDataMessage` → `emptyTitle` / `emptyMessage`
    - column `name` → `header`, `selector` → `key`
  - `paginationType="scroll"` → `hasMore` / `loadingMore` / `onLoadMore`, with the app accumulating the rows.

### Pagination
- **MedEquip:** `meta={{ page, limit, total, … }}` → `page={meta.page} pageSize={meta.limit} total={meta.total}`.
- **Omega:**
  - `totalCount` → `total`. `totalPages` is calculated.
  - The page-size selector appears only with `onPageSizeChange`.

### InfiniteList (Omega `RtkFlatList`, `RtkIntersectionObserver`)
- Renamed props:
  - `listData` → `items`, with a new required `getItemKey`
  - `hasNextPage` → `hasMore`, `onIntersect` → `onLoadMore`
  - `isFetchingNextPage` → `loadingMore`, the first load → `loading`
  - `DataNotFound` → `empty`
- `RtkIntersectionObserver` → the `useInfiniteScroll` hook.
- There's no toast and no offline text: errors show inline with a retry button.

### CardListView (Omega)
- Renamed props:
  - `data` → `rows`, `progressPending` → `loading`
  - `isError` / `refetch` → `error` / `onRetry`, `emptyDataMessage` → `emptyTitle`
  - `maxHeight` → `className="max-h-[480px]"`
  - `titleClassName` → `classNames.title`, `getRowClassName` → `rowClassName`
- `tableState` paging → `hasMore` / `loadingMore` / `onLoadMore`. `accumulate` was removed: pass all loaded rows.
- `getRowKey` is required.
- Actions: `{ icon: Component, title, getIcon, getTone, getTitle }` → `{ key, label, icon: ReactNode, tone }`. Each of `label`, `icon` and `tone` can be a function of the row. Tones `default` → `neutral`, `danger` → `error`.

### SortableList
- Same API, now typed.

## Navigation

### PageHeader (MedEquip)
- `backTo={{ label, to }}` → `back={{ label, href }}` or `back={{ label, onClick: () => navigate(-1) }}`.

### BackLink (Omega `BackNavLink`)
- `name` → `label`, `path` → `href`. `size="default"` → `"md"`.
- With neither `href` nor `onClick`, it calls `history.back()`.
- `variant` was removed; use `className`.

### Tabs (MedEquip `TabNav`) and SideTabs
- `tabs` → `items`, and each item's `key` → `value`.
- Tabs: `count` now shows whenever it's defined. Pass `count || undefined` to hide zeros.
- SideTabs: `icon: User` (a component) → `icon: <User size={16} />`.

## Overlays

### Modal (MedEquip `Modal`, Omega `CommonModal`)
- `isOpen` → `open`.
- The `#__modal_container__` element is no longer needed: it renders into `document.body`, or the `container` prop.
- **MedEquip:** with a custom `header`, the × stays hidden. Pass `showClose` to get it.
- **Omega:**
  - Renamed props:
    - `isLoading` → `busy`
    - `onClickOutsideCloseModal` → `closeOnBackdrop`
    - `layourClassName` → `classNames.overlay`
    - `contentContainerClassName` → `className`
  - `maxWidth="992px"` → `className="max-w-[992px]"` or `size`.
  - The body is padded by default; use `flushBody` to remove it.

### ConfirmDialog (MedEquip `ConfirmDialog`, Omega `ConfirmationModal`)
- **MedEquip:** `isOpen` → `open`. Everything else is the same.
- **Omega:**
  - Renamed props:
    - `closeModal` → `onClose`
    - `confirmationCallback` → `onConfirm`
    - `isLoading` → `loading`
    - `confirmButtonName` / `cancelButtonName` → `confirmLabel` / `cancelLabel`
  - `variant` → `tone` (Omega's default look is now `tone="warning"`, the default).
  - `showIcon={false}` → `icon={null}`.
  - The default title is now "Are you sure?" instead of "Confirmation".
- **Both:** if `onConfirm` returns a promise, the dialog shows loading until it settles. It never closes itself; close it in `onConfirm`.

## Feedback

### Loaders
- **MedEquip:** `PageLoader` and `InlineLoader` are unchanged. `Spinner`, `EmptyState` and `ErrorState` come from corbel.
- **Omega:**
  - `PageLoader` → `<PageLoader label={null} className="min-h-[calc(100vh-90px)]" />`.
  - `CommonLoader` → `<Spinner />`.
  - `LoadingDots`: the `color` prop is gone; the dots follow the text colour.

### ErrorPage (Omega `errorPages/*`)

| Omega | `variant` |
|---|---|
| `ForbiddenError` | `"forbidden"` |
| `PageNotFound` | `"not-found"` |
| `ContentNotFound` | `"content-not-found"` |
| `ServerError` | `"server-error"` |
| `ServiceUnavailableError` | `"service-unavailable"` |
| `ConnectionError` | `"offline"` |
| `TimeOut` | `"timeout"` |
| `GeneralError` | `"general"` |

- `<ErrorHandler error={e} onRetry={r} />` → `<ErrorPage variant={getErrorVariant(e)} onRetry={r} />`.
- The home link → `homeHref="/"` or `onHome={() => navigate("/")}`.
- Pages no longer reload by themselves: pass `onRetry={() => location.reload()}`.
- `useGetOnlineStatus` → `useOnlineStatus()`, which returns a boolean; show your own toast.

### ErrorBoundary (Omega)
- `fallback` takes a node or `({ error, reset }) => node`.
- "Try again" re-renders the children instead of reloading the page.
- Use `onError` for logging and `resetKeys` (e.g. the pathname) to reset automatically.

### Rich text (Omega `TextEditor`)
- Import from `corbel/editor` and install the Tiptap peers ([TextEditor](components/TextEditor.md)).
- Renamed props:
  - `isReadOnly` → `disabled`, `isRequired` → `required`
  - `EditorContentClassName` → `classNames.content`, `labelClassName` → `classNames.label`
- `debounceTime` (default 1500) → `debounceMs` (default 0). Pass `debounceMs={1500}` for the old behaviour.
- `onImageUpload(file) => Promise<url>` now works.
- `tiptap-extension-resize-image` was removed.
