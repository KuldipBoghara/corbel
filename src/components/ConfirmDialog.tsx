"use client";

import { useId, useState, type ReactNode } from "react";
import {
  CircleCheck,
  CircleQuestionMark,
  Info,
  ShieldExclamationPoint,
  TriangleExclamationPoint,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { Button } from "./Button.js";
import { Modal } from "./Modal.js";

export type ConfirmDialogTone = "danger" | "warning" | "primary" | "info" | "success";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  /** Return a promise to show a spinner and block closing until it settles. Close the dialog yourself on success. */
  onConfirm: () => void | Promise<unknown>;
  /** @default "Are you sure?" */
  title?: ReactNode;
  message?: ReactNode;
  /** @default "Confirm" */
  confirmLabel?: ReactNode;
  /** @default "Cancel" */
  cancelLabel?: ReactNode;
  /** Icon colour and confirm button style ("danger" makes it red). @default "warning" */
  tone?: ConfirmDialogTone;
  /** Shows the confirm spinner and blocks closing, for loading state you track yourself. */
  loading?: boolean;
  /** Replaces the tone icon. Pass `null` to hide it. */
  icon?: ReactNode;
  /** Styles the panel. */
  className?: string;
}

const TONES: Record<ConfirmDialogTone, { icon: ReactNode; wrap: string }> = {
  danger: { icon: <ShieldExclamationPoint size={20} />, wrap: "bg-error/10 text-error" },
  warning: { icon: <TriangleExclamationPoint size={20} />, wrap: "bg-warning/10 text-warning" },
  primary: { icon: <CircleQuestionMark size={20} />, wrap: "bg-primary-50 text-primary" },
  info: { icon: <Info size={20} />, wrap: "bg-info/10 text-info" },
  success: { icon: <CircleCheck size={20} />, wrap: "bg-success/10 text-success" },
};

/**
 * Confirmation step for anything destructive or hard to reverse.
 *
 * ```tsx
 * <ConfirmDialog open={!!target} onClose={() => setTarget(null)} tone="danger"
 *   title="Delete user?" message="This cannot be undone." confirmLabel="Delete"
 *   onConfirm={async () => { await deleteUser(target.id); setTarget(null); }} />
 * ```
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "warning",
  loading = false,
  icon,
  className,
}: ConfirmDialogProps) {
  const id = useId();
  const [pending, setPending] = useState(false);
  const busy = loading || pending;
  const { icon: toneIcon, wrap } = TONES[tone];
  const shownIcon = icon === undefined ? toneIcon : icon;

  const confirm = async () => {
    if (busy) return;
    const result = onConfirm();
    if (!(result instanceof Promise)) return;
    setPending(true);
    try {
      await result;
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      busy={busy}
      role="alertdialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={message ? `${id}-message` : undefined}
      className={className}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={confirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 py-2">
        {shownIcon && (
          <div
            className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", wrap)}
          >
            {shownIcon}
          </div>
        )}
        <div className="min-w-0 pt-0.5 pr-6">
          <h2 id={`${id}-title`} className="text-sm font-bold text-text-primary">
            {title}
          </h2>
          {message && (
            <p id={`${id}-message`} className="mt-1 text-sm leading-relaxed text-text-secondary">
              {message}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
