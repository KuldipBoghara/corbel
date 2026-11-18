"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  CircleAlert,
  CloudUpload,
  FileImage,
  FilePlay,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  Paperclip,
  RotateCw,
  X,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { Button } from "./Button.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";
import { PhotoThumb } from "./PhotoThumb.js";

/** What `onUpload` resolves with: the stored file as your API describes it. */
export interface UploadedFile {
  url: string;
  name?: string;
  size?: number;
  /** MIME type, used to pick the icon and to decide on an image preview. */
  type?: string;
  id?: string;
}

export interface UploadContext {
  /** Report progress, 0–100. */
  onProgress: (pct: number) => void;
  /** Aborted when the user removes the file mid-upload or the component unmounts. */
  signal: AbortSignal;
}

/** Sends one file to your API. Throw (ideally an `Error` with a readable message) to fail it. */
export type UploadHandler = (file: File, ctx: UploadContext) => Promise<UploadedFile>;

/** A picked `File` (no `onUpload`) or a stored file (`onUpload` result, or an existing record). */
export type FileItem = File | UploadedFile;

export type FileUploaderVariant = "dropzone" | "button" | "tile";
export type FileUploaderDisplay = "list" | "grid";
export type FileUploaderSlot = FieldSlot | "trigger" | "list" | "item";

interface FileUploaderBaseProps extends FieldProps {
  /**
   * Uploads each file as soon as it is picked; the resolved value is what lands
   * in `value`. Omit it to get the picked `File` objects back and upload them
   * yourself (e.g. with the form submit).
   */
  onUpload?: UploadHandler;
  /**
   * Called after a stored file is removed from `value`. Return a rejected promise
   * (e.g. a failed delete request) to put the file back.
   */
  onRemove?: (item: FileItem) => void | Promise<unknown>;
  /** Validation and upload failures, ready to show in a toast. */
  onError?: (message: string) => void;
  /** True while any upload is in flight, so you can disable the form submit. */
  onUploadingChange?: (uploading: boolean) => void;
  /** Like the native attribute: `"image/*,.pdf"` or `["image/png", "image/jpeg"]`. */
  accept?: string | string[];
  /** Largest allowed file, in bytes. */
  maxSize?: number;
  /** Most files `value` may hold (with `multiple`). */
  maxFiles?: number;
  /** Opens the camera on phones, e.g. `"environment"` for the rear camera. */
  capture?: boolean | "user" | "environment";
  disabled?: boolean;
  /**
   * `"dropzone"`: full-width drop area. `"button"`: a compact button.
   * `"tile"`: a small square add tile at the end of a `"grid"`.
   * @default "dropzone"
   */
  variant?: FileUploaderVariant;
  /** How chosen files are shown. @default "list" */
  display?: FileUploaderDisplay;
  /** Text inside the trigger. */
  prompt?: ReactNode;
  /** Icon inside the trigger. */
  icon?: ReactNode;
  /** Renders a stored file's grid thumbnail yourself, e.g. for private files behind auth. */
  renderPreview?: (item: FileItem) => ReactNode;
  id?: string;
  /** Styles the root. Use `classNames` for the other parts. */
  className?: string;
  classNames?: Partial<Record<FileUploaderSlot, string>>;
}

export interface SingleFileUploaderProps extends FileUploaderBaseProps {
  multiple?: false;
  value?: FileItem | null;
  onChange?: (value: FileItem | null) => void;
}

export interface MultipleFileUploaderProps extends FileUploaderBaseProps {
  multiple: true;
  value?: FileItem[];
  onChange?: (value: FileItem[]) => void;
}

export type FileUploaderProps = SingleFileUploaderProps | MultipleFileUploaderProps;

interface Pending {
  key: number;
  file: File;
  progress: number;
  error?: string;
}

/** `12.4 MB` / `840 KB` / `512 B`. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Same rules as the native `accept` attribute: `.ext`, `type/*` or an exact MIME type. */
export function matchesAccept(file: File, accept: string | string[] | undefined): boolean {
  const tokens = (Array.isArray(accept) ? accept : (accept ?? "").split(","))
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((t) =>
    t.startsWith(".") ? name.endsWith(t) : t.endsWith("/*") ? type.startsWith(t.slice(0, -1)) : type === t,
  );
}

const messageOf = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : typeof err === "string" ? err : fallback;

const itemName = (item: FileItem) =>
  item.name || ("url" in item ? decodeURIComponent(item.url.split(/[?#]/)[0]!.split("/").pop() ?? "") : "") || "File";

const isImage = (item: FileItem) =>
  item.type ? item.type.startsWith("image/") : "url" in item && /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(item.url);

function FileTypeIcon({ type, className }: { type?: string; className?: string }) {
  const Icon = type?.startsWith("image/")
    ? FileImage
    : type?.startsWith("video/")
      ? FilePlay
      : /sheet|excel|csv/.test(type ?? "")
        ? FileSpreadsheet
        : FileText;
  return <Icon size={16} className={cn("shrink-0 text-text-muted", className)} aria-hidden />;
}

/** Image preview of a picked `File`, via an object URL that is revoked on unmount. */
function LocalPreview({ file, className }: { file: File; className?: string }) {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <PhotoThumb src={src} alt={file.name} openable={false} className={className} />;
}

/**
 * File input with drag & drop, validation, per-file upload progress, retry and
 * previews. One component covers single and multiple files, a dropzone, a
 * button or an inline photo tile.
 *
 * ```tsx
 * <FileUploader
 *   multiple
 *   label="Attachments"
 *   accept="image/*,.pdf"
 *   maxSize={10 * 1024 * 1024}
 *   value={files}
 *   onChange={setFiles}
 *   onUpload={uploadToApi}
 *   onError={toast.error}
 * />
 * ```
 */
export const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(function FileUploader(
  props,
  ref,
) {
  const {
    label,
    hint,
    error,
    required,
    optional,
    multiple = false,
    onUpload,
    onRemove,
    onError,
    onUploadingChange,
    accept,
    maxSize,
    maxFiles = Infinity,
    capture,
    disabled = false,
    variant = "dropzone",
    display = "list",
    prompt,
    icon,
    renderPreview,
    id,
    className,
    classNames,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);

  const items: FileItem[] = props.multiple ? (props.value ?? []) : props.value ? [props.value] : [];
  // Latest value, also updated right after we emit so that two uploads finishing
  // before the parent re-renders don't overwrite each other.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const emit = (next: FileItem[]) => {
    itemsRef.current = next;
    if (props.multiple) props.onChange?.(next);
    else props.onChange?.(next[0] ?? null);
  };

  const [pending, setPending] = useState<Pending[]>([]);
  const controllers = useRef(new Map<number, AbortController>());
  const nextKey = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const map = controllers.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  const uploading = pending.some((p) => !p.error);
  const lastUploading = useRef(false);
  useEffect(() => {
    if (lastUploading.current === uploading) return;
    lastUploading.current = uploading;
    onUploadingChange?.(uploading);
  });

  const patch = (key: number, change: Partial<Pending>) =>
    setPending((list) => list.map((p) => (p.key === key ? { ...p, ...change } : p)));

  const dropPending = (key: number) => {
    controllers.current.get(key)?.abort();
    controllers.current.delete(key);
    setPending((list) => list.filter((p) => p.key !== key));
  };

  const commit = (added: FileItem[]) => emit(multiple ? [...itemsRef.current, ...added] : added.slice(0, 1));

  const upload = (file: File, key: number) => {
    if (!onUpload) return;
    const controller = new AbortController();
    controllers.current.set(key, controller);
    onUpload(file, {
      signal: controller.signal,
      onProgress: (pct) => {
        if (!controller.signal.aborted) patch(key, { progress: Math.max(0, Math.min(100, pct)) });
      },
    }).then(
      (result) => {
        if (controller.signal.aborted) return;
        controllers.current.delete(key);
        setPending((list) => list.filter((p) => p.key !== key));
        commit([result]);
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        controllers.current.delete(key);
        const message = messageOf(err, "Upload failed.");
        patch(key, { error: message, progress: 0 });
        onError?.(`${file.name}: ${message}`);
      },
    );
  };

  const addFiles = (picked: File[]) => {
    if (disabled || !picked.length) return;
    const candidates = multiple ? picked : picked.slice(0, 1);
    const room = multiple ? maxFiles - itemsRef.current.length - pending.length : 1;
    const accepted: File[] = [];
    for (const file of candidates) {
      if (!matchesAccept(file, accept)) {
        onError?.(`${file.name}: this file type is not allowed.`);
      } else if (maxSize !== undefined && file.size > maxSize) {
        onError?.(`${file.name} is larger than ${formatFileSize(maxSize)}.`);
      } else if (accepted.length >= room) {
        onError?.(`You can add up to ${maxFiles} files.`);
        break;
      } else {
        accepted.push(file);
      }
    }
    if (!accepted.length) return;

    if (!onUpload) {
      commit(accepted);
      return;
    }
    // A single uploader replaces whatever is still uploading.
    if (!multiple) pending.forEach((p) => dropPending(p.key));
    const added = accepted.map((file) => ({ key: nextKey.current++, file, progress: 0 }));
    setPending((list) => [...list, ...added]);
    added.forEach((p) => upload(p.file, p.key));
  };

  const retry = (p: Pending) => {
    patch(p.key, { error: undefined, progress: 0 });
    upload(p.file, p.key);
  };

  const removeAt = (index: number) => {
    const previous = itemsRef.current;
    const item = previous[index]!;
    emit(previous.filter((_, i) => i !== index));
    // ponytail: reverts to the list as it was before the remove, so a change made
    // while the delete request is in flight is lost if that request fails.
    Promise.resolve(onRemove?.(item)).catch((err: unknown) => {
      emit(previous);
      onError?.(messageOf(err, `Could not remove ${itemName(item)}.`));
    });
  };

  const limit = multiple ? maxFiles : 1;
  const full = items.length + pending.length >= limit;
  const showTrigger = !disabled && !full;
  const accepts = Array.isArray(accept) ? accept.join(",") : accept;

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };
  const dropHandlers = { onDragOver, onDragLeave: () => setDragging(false), onDrop };

  const removeButton = (name: string, onClick: () => void, floating: boolean) =>
    !disabled && (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Remove ${name}`}
        className={cn(
          "flex shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:text-error",
          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
          floating
            ? "absolute -top-1.5 -right-1.5 bg-bg-card p-0.5 shadow ring-1 ring-border-default"
            : "p-1 hover:bg-error/10",
        )}
      >
        <X size={14} aria-hidden />
      </button>
    );

  const progressBar = (p: Pending) =>
    !p.error && (
      <div
        role="progressbar"
        aria-label={`Uploading ${p.file.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={p.progress}
        className="h-1 w-full overflow-hidden rounded-full bg-primary-100"
      >
        <div className="h-full bg-primary transition-[width]" style={{ width: `${p.progress}%` }} />
      </div>
    );

  const retryButton = (p: Pending) => (
    <button
      type="button"
      onClick={() => retry(p)}
      aria-label={`Retry ${p.file.name}`}
      className="flex shrink-0 cursor-pointer items-center rounded-full p-1 text-text-muted transition-colors hover:bg-bg-main hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      <RotateCw size={14} aria-hidden />
    </button>
  );

  const renderTrigger = (ids: { id: string; describedBy?: string; invalid: boolean }) => {
    if (!showTrigger) return null;
    const common = {
      id: ids.id,
      type: "button" as const,
      onClick: () => inputRef.current?.click(),
      "aria-describedby": ids.describedBy,
      "aria-invalid": ids.invalid || undefined,
      ...dropHandlers,
    };
    if (variant === "button") {
      return (
        <Button
          {...common}
          variant="outline"
          size="sm"
          startIcon={icon ?? <Paperclip size={15} aria-hidden />}
          className={cn(dragging && "border-primary bg-primary-50", ids.invalid && "border-error", classNames?.trigger)}
        >
          {prompt ?? (multiple ? "Add files" : "Choose file")}
        </Button>
      );
    }
    if (variant === "tile") {
      return (
        <button
          {...common}
          className={cn(
            "flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-default text-text-muted transition-colors",
            "hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
            dragging && "border-primary bg-primary-50 text-primary",
            ids.invalid && "border-error",
            classNames?.trigger,
          )}
        >
          {icon ?? <ImagePlus size={18} aria-hidden />}
          <span className="text-[10px] font-semibold">{prompt ?? "Add"}</span>
        </button>
      );
    }
    return (
      <button
        {...common}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border-default bg-bg-main/60 px-4 py-7 text-text-muted transition-colors",
          "hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
          dragging && "border-primary bg-primary-50 text-primary",
          ids.invalid && "border-error bg-error/5",
          classNames?.trigger,
        )}
      >
        {icon ?? <CloudUpload size={22} aria-hidden />}
        <span className="text-xs font-semibold">
          {prompt ?? (multiple ? "Click to upload or drag files here" : "Click to upload or drag a file here")}
        </span>
        {(accepts || maxSize !== undefined) && (
          <span className="text-[11px]">
            {[accepts?.split(",").join(", "), maxSize !== undefined && `up to ${formatFileSize(maxSize)}`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        )}
      </button>
    );
  };

  const gridTile = "size-20 rounded-lg border border-border-default";

  const grid = (trigger: ReactNode) => (
    <ul className={cn("flex flex-wrap gap-2", classNames?.list)}>
      {items.map((item, i) => (
        <li key={`${i}-${"id" in item ? item.id : ""}-${itemName(item)}`} className={cn("relative", classNames?.item)}>
          {renderPreview ? (
            renderPreview(item)
          ) : item instanceof File ? (
            isImage(item) ? (
              <LocalPreview file={item} className={gridTile} />
            ) : (
              <div className={cn(gridTile, "flex flex-col items-center justify-center gap-1 bg-bg-main p-1")}>
                <FileTypeIcon type={item.type} />
                <span className="w-full truncate text-center text-[10px] text-text-secondary">{item.name}</span>
              </div>
            )
          ) : isImage(item) ? (
            <PhotoThumb src={item.url} alt={itemName(item)} className={gridTile} />
          ) : (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className={cn(gridTile, "flex flex-col items-center justify-center gap-1 bg-bg-main p-1 hover:bg-primary-50")}
            >
              <FileTypeIcon type={item.type} />
              <span className="w-full truncate text-center text-[10px] text-text-secondary">{itemName(item)}</span>
            </a>
          )}
          {removeButton(itemName(item), () => removeAt(i), true)}
        </li>
      ))}
      {pending.map((p) => (
        <li key={`p${p.key}`} className={cn("relative", classNames?.item)}>
          {isImage(p.file) ? (
            <LocalPreview file={p.file} className={cn(gridTile, "opacity-60")} />
          ) : (
            <div className={cn(gridTile, "flex items-center justify-center bg-bg-main")}>
              <FileTypeIcon type={p.file.type} />
            </div>
          )}
          <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center">
            {p.error ? (
              <span className="rounded-full bg-bg-card shadow" title={p.error}>
                {retryButton(p)}
              </span>
            ) : (
              progressBar(p)
            )}
          </div>
          {removeButton(p.file.name, () => dropPending(p.key), true)}
        </li>
      ))}
      {trigger && <li>{trigger}</li>}
    </ul>
  );

  const rowClass = cn(
    "flex items-center gap-2 rounded-lg border border-border-default bg-bg-card px-3 py-2",
    classNames?.item,
  );

  const list = (
    <ul className={cn("flex flex-col gap-1.5", classNames?.list)}>
      {items.map((item, i) => {
        const name = itemName(item);
        return (
          <li key={`${i}-${"id" in item ? item.id : ""}-${name}`} className={rowClass}>
            <FileTypeIcon type={item.type} />
            {"url" in item ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-sm text-text-primary hover:text-primary hover:underline"
              >
                {name}
              </a>
            ) : (
              <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{name}</span>
            )}
            {!!item.size && <span className="shrink-0 text-xs text-text-muted">{formatFileSize(item.size)}</span>}
            {removeButton(name, () => removeAt(i), false)}
          </li>
        );
      })}
      {pending.map((p) => (
        <li key={`p${p.key}`} className={cn(rowClass, p.error && "border-error/30 bg-error/5")}>
          {p.error ? (
            <CircleAlert size={16} className="shrink-0 text-error" aria-hidden />
          ) : (
            <FileTypeIcon type={p.file.type} />
          )}
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm text-text-primary">{p.file.name}</span>
            {p.error ? <span className="block truncate text-xs text-error">{p.error}</span> : progressBar(p)}
          </div>
          {!p.error && <span className="shrink-0 text-xs text-text-muted tabular-nums">{p.progress}%</span>}
          {p.error && retryButton(p)}
          {removeButton(p.file.name, () => dropPending(p.key), false)}
        </li>
      ))}
    </ul>
  );

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
      classNames={classNames}
    >
      {(ids) => {
        const trigger = renderTrigger(ids);
        const hasFiles = items.length + pending.length > 0;
        return (
          <>
            <input
              ref={inputRef}
              type="file"
              hidden
              tabIndex={-1}
              multiple={multiple}
              accept={accepts}
              capture={capture}
              disabled={disabled}
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                // Cleared so picking the same file again still fires a change.
                e.target.value = "";
              }}
            />
            {display === "grid" ? (
              variant === "tile" ? (
                grid(trigger)
              ) : (
                <div className="flex flex-col gap-3">
                  {trigger}
                  {hasFiles && grid(null)}
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                {trigger}
                {hasFiles && list}
              </div>
            )}
          </>
        );
      }}
    </FormField>
  );
});
