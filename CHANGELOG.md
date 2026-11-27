# corbel

## 0.2.0

### Minor Changes

- 7d3ea86: Add `Alert`: an inline info, success, warning or error message with optional title, action and dismiss button.
- 72b1e2b: Add `Drawer`: a full-height side panel that slides in from the right or left. It takes the same props as `Modal`, plus `placement` and `size`.
- a746ea5: Add `Menu`: an action menu that opens from a trigger button, with icons, separators, danger items, conditional items and full keyboard support.
- a68eac9: Add `RadioGroup`: native radio buttons with options, descriptions, horizontal or vertical layout, and the shared label/hint/error field props.
- 7f95784: Add `Skeleton`: pulsing loading placeholder with `text` (multi-line), `rect` and `circle` variants.
- 18bcf69: Add `Tooltip`: hover and focus hint rendered in a portal, with placement, flipping, delay and Escape to close.

## 0.1.0

### Minor Changes

- First release: 43 components merged from the MedEquip and Omega apps' shared component folders.
  - **Inputs:** Button, Input, TextArea, Checkbox, Switch, OtpInput, SearchBar, SegmentedControl, FileUploader, FormField, Label
  - **Pickers:** Dropdown, DatePicker, TimePicker, SearchSelectList, MultiSelectList
  - **Data display:** Card, Avatar, Badge, StatusBadge, StatTile, Accordion, PhotoThumb
  - **Tables and lists:** DataTable, Pagination, CardListView, InfiniteList, SortableList
  - **Navigation:** PageHeader, BackLink, Tabs, SideTabs
  - **Overlays:** Modal, ConfirmDialog
  - **Feedback:** Spinner, EmptyState, ErrorState, PageLoader, InlineLoader, LoadingDots, ErrorPage, ErrorBoundary
  - **Rich text:** TextEditor (`corbel/editor`)
- Theming through Tailwind v4 `@theme` tokens, set up with `@import "corbel/styles.css"`.
