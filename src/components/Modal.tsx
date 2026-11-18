"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../utils/cn.js";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalSlot =
  | "overlay"
  | "panel"
  | "header"
  | "title"
  | "description"
  | "body"
  | "footer"
  | "close";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Heading of the default title bar. Also labels the dialog for screen readers. */
  title?: ReactNode;
  /** Smaller text under the title. Also describes the dialog for screen readers. */
  description?: ReactNode;
  /** Replaces the default title bar entirely, for dialogs with their own header. */
  header?: ReactNode;
  children?: ReactNode;
  /** Actions row under the body (right-aligned, stacked on mobile). */
  footer?: ReactNode;
  /** @default "md" */
  size?: ModalSize;
  /** Blocks backdrop, Escape and close-button closing, e.g. while a request is in flight. */
  busy?: boolean;
  /** Clicking the dimmed backdrop closes the dialog. @default true */
  closeOnBackdrop?: boolean;
  /** Shows the × button. @default true, or false when `header` is given */
  showClose?: boolean;
  /** Removes the body padding, e.g. for an image or table that must reach the edges. */
  flushBody?: boolean;
  /** Portal target. @default document.body */
  container?: HTMLElement | null;
  /** "alertdialog" for confirmations that interrupt the user. @default "dialog" */
  role?: "dialog" | "alertdialog";
  /** Accessible name when there is no `title` (e.g. with a custom `header`). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  /** Styles the panel. */
  className?: string;
  classNames?: Partial<Record<ModalSlot, string>>;
}

const SIZES: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none min-h-[calc(100dvh-2rem)]",
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const closeButtonClass =
  "shrink-0 cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-main hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Accessible dialog rendered in a portal. Escape and the backdrop close it,
 * page scroll is locked, focus moves in on open, stays inside while tabbing,
 * and returns to the trigger on close.
 *
 * ```tsx
 * <Modal open={open} onClose={() => setOpen(false)} title="Edit user"
 *   footer={<Button onClick={save}>Save</Button>}>
 *   …
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  header,
  children,
  footer,
  size = "md",
  busy = false,
  closeOnBackdrop = true,
  showClose = header === undefined,
  flushBody = false,
  container,
  role = "dialog",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
  classNames,
}: ModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const panelRef = useRef<HTMLDivElement>(null);
  // Captured during render, before any `autoFocus` child inside the dialog steals focus.
  const triggerRef = useRef<Element | null>(null);
  if (!open) triggerRef.current = null;
  else if (!triggerRef.current && typeof document !== "undefined")
    triggerRef.current = document.activeElement;

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const requestClose = () => {
    if (!busy) onClose();
  };

  // React key events bubble through portals, so a nested dialog handles Escape
  // first and stops it from also closing its parent.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      requestClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const hasTitleBar = header === undefined && Boolean(title || description);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      onKeyDown={onKeyDown}
    >
      <div
        className={cn(
          "animate-corbel-fade-in fixed inset-0 bg-black/50 backdrop-blur-[2px]",
          classNames?.overlay,
        )}
        onClick={() => closeOnBackdrop && requestClose()}
        aria-hidden
      />

      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        tabIndex={-1}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (title && header === undefined ? titleId : undefined)}
        aria-describedby={
          ariaDescribedBy ?? (description && header === undefined ? descriptionId : undefined)
        }
        aria-busy={busy || undefined}
        className={cn(
          "animate-corbel-fade-in relative my-auto flex w-full flex-col overflow-hidden rounded-2xl bg-bg-card shadow-2xl outline-none",
          SIZES[size],
          classNames?.panel,
          className,
        )}
      >
        {header}

        {hasTitleBar && (
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b border-border-default px-5 py-4",
              classNames?.header,
            )}
          >
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className={cn(
                    "text-base font-bold tracking-tight text-text-primary",
                    classNames?.title,
                  )}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className={cn("mt-0.5 text-xs text-text-secondary", classNames?.description)}
                >
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={requestClose}
                disabled={busy}
                aria-label="Close dialog"
                className={cn("-mr-1", closeButtonClass, classNames?.close)}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {!hasTitleBar && showClose && (
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            aria-label="Close dialog"
            className={cn("absolute top-3 right-3 z-10", closeButtonClass, classNames?.close)}
          >
            <X size={18} />
          </button>
        )}

        <div
          className={cn(
            "corbel-scrollbar overflow-y-auto",
            size === "full" ? "flex-1" : "max-h-[70vh]",
            !flushBody && "px-5 py-4",
            classNames?.body,
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              "flex flex-col-reverse gap-2 border-t border-border-default px-5 py-4 sm:flex-row sm:justify-end",
              classNames?.footer,
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    container ?? document.body,
  );
}
