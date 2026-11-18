// ─── Utilities ──────────────────────────────────────────────────────────────
export { cn } from "./utils/cn.js";

// ─── Inputs ─────────────────────────────────────────────────────────────────
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./components/Button.js";
export {
  FormField,
  Label,
  type FormFieldProps,
  type FieldProps,
  type FieldSlot,
  type LabelProps,
} from "./components/FormField.js";
export { Input, type InputProps, type InputSize } from "./components/Input.js";
export { TextArea, type TextAreaProps } from "./components/TextArea.js";
export { Checkbox, type CheckboxProps, type CheckboxSize, type CheckboxSlot } from "./components/Checkbox.js";
export { Switch, type SwitchProps, type SwitchSize, type SwitchSlot } from "./components/Switch.js";
export { OtpInput, type OtpInputProps, type OtpInputSlot } from "./components/OtpInput.js";
export { SearchBar, type SearchBarProps, type SearchBarSlot } from "./components/SearchBar.js";
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
  type SegmentedControlTone,
  type SegmentedControlSlot,
} from "./components/SegmentedControl.js";
export {
  FileUploader,
  formatFileSize,
  matchesAccept,
  type FileUploaderProps,
  type SingleFileUploaderProps,
  type MultipleFileUploaderProps,
  type FileUploaderVariant,
  type FileUploaderDisplay,
  type FileUploaderSlot,
  type FileItem,
  type UploadedFile,
  type UploadContext,
  type UploadHandler,
} from "./components/FileUploader.js";

// ─── Pickers & selection ────────────────────────────────────────────────────
export {
  Dropdown,
  type DropdownProps,
  type DropdownSingleProps,
  type DropdownMultiProps,
  type DropdownOption,
  type DropdownGroup,
  type DropdownSize,
  type DropdownSlot,
} from "./components/Dropdown.js";
export {
  DatePicker,
  parseISODate,
  parseTypedDate,
  toISODate,
  type DatePickerProps,
  type DatePickerSize,
  type DatePickerSlot,
} from "./components/DatePicker.js";
export {
  TimePicker,
  parseTime,
  formatTime,
  to24Hour,
  type TimePickerProps,
  type TimePickerSize,
  type TimePickerSlot,
} from "./components/TimePicker.js";
export {
  SearchSelectList,
  type SearchSelectListProps,
  type SearchSelectListMultiProps,
  type SearchSelectListSingleProps,
  type SearchSelectListSlot,
  type ListKey,
} from "./components/SearchSelectList.js";
export {
  MultiSelectList,
  type MultiSelectListProps,
  type MultiSelectOption,
  type MultiSelectListSlot,
} from "./components/MultiSelectList.js";

// ─── Data display ───────────────────────────────────────────────────────────
export { Card, CardHeader, type CardProps, type CardHeaderProps, type CardHeaderSlot } from "./components/Card.js";
export { Avatar, type AvatarProps, type AvatarSize } from "./components/Avatar.js";
export {
  Badge,
  StatusBadge,
  type BadgeProps,
  type BadgeTone,
  type BadgeSize,
  type StatusBadgeProps,
} from "./components/Badge.js";
export {
  StatTile,
  StatTileRow,
  type StatTileProps,
  type StatTileRowProps,
  type StatTileSlot,
} from "./components/StatTile.js";
export { Accordion, type AccordionProps, type AccordionItem, type AccordionSlot } from "./components/Accordion.js";
export { PhotoThumb, type PhotoThumbProps } from "./components/PhotoThumb.js";

// ─── Tables & lists ─────────────────────────────────────────────────────────
export {
  DataTable,
  type DataTableProps,
  type DataTableSlot,
  type Column,
  type ColumnAlign,
  type SortState,
  type SortDirection,
  type RowKey,
} from "./components/DataTable.js";
export {
  Pagination,
  getPageRange,
  type PaginationProps,
  type PaginationSlot,
  type PageRangeItem,
} from "./components/Pagination.js";
export {
  CardListView,
  type CardListViewProps,
  type CardListViewSlot,
  type CardAction,
  type CardActionTone,
  type CardListVariant,
} from "./components/CardListView.js";
export {
  InfiniteList,
  useInfiniteScroll,
  type InfiniteListProps,
  type InfiniteListSlot,
  type UseInfiniteScrollOptions,
} from "./components/InfiniteList.js";
export {
  SortableList,
  SortableItem,
  useSortableOrder,
  type SortableListProps,
  type SortableItemProps,
  type SortableId,
  type ReorderMove,
  type UseSortableOrderOptions,
  type UseSortableOrderResult,
} from "./components/SortableList.js";

// ─── Navigation ─────────────────────────────────────────────────────────────
export { PageHeader, type PageHeaderProps, type PageHeaderSlot } from "./components/PageHeader.js";
export { BackLink, type BackLinkProps, type BackLinkSize } from "./components/BackLink.js";
export { Tabs, type TabsProps, type TabItem, type TabKey, type TabsSlot } from "./components/Tabs.js";
export { SideTabs, type SideTabsProps, type SideTabsSlot } from "./components/SideTabs.js";

// ─── Overlays ───────────────────────────────────────────────────────────────
export { Modal, type ModalProps, type ModalSize, type ModalSlot } from "./components/Modal.js";
export { ConfirmDialog, type ConfirmDialogProps, type ConfirmDialogTone } from "./components/ConfirmDialog.js";

// ─── Feedback ───────────────────────────────────────────────────────────────
export {
  Spinner,
  EmptyState,
  ErrorState,
  type SpinnerProps,
  type EmptyStateProps,
  type EmptyStateSlot,
  type ErrorStateProps,
} from "./components/Feedback.js";
export { PageLoader, InlineLoader, LoadingDots, type LoaderProps, type LoadingDotsProps } from "./components/Loader.js";
export {
  ErrorPage,
  getErrorVariant,
  useOnlineStatus,
  type ErrorPageProps,
  type ErrorPageVariant,
  type ErrorPageSlot,
} from "./components/ErrorPage.js";
export { ErrorBoundary, type ErrorBoundaryProps, type ErrorBoundaryFallbackProps } from "./components/ErrorBoundary.js";
