"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../utils/cn.js";

export type AlertTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";
export type AlertSlot = "icon" | "title" | "content" | "action" | "close";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** @default "info" */
  tone?: AlertTone;
  /** Bold first line. */
  title?: ReactNode;
  /** Replaces the tone's icon. Pass `false` for no icon. */
  icon?: ReactNode | false;
  /** Button or link shown at the end, e.g. "Retry". */
  action?: ReactNode;
  /** Shows a × button that calls this. */
  onClose?: () => void;
  /** Styles the root. */
  className?: string;
  classNames?: Partial<Record<AlertSlot, string>>;
}

const TONES: Record<AlertTone, string> = {
  neutral: "border-border-default bg-bg-main text-text-secondary",
  primary: "border-primary-200 bg-primary-50 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  error: "border-error/30 bg-error/10 text-error",
  info: "border-info/30 bg-info/10 text-info",
};

const ICONS: Record<AlertTone, typeof Info> = {
  neutral: Info,
  primary: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  info: Info,
};

/**
 * Inline message box for info, success, warning and error states.
 * Errors and warnings are announced immediately (`role="alert"`), the rest politely (`role="status"`).
 *
 * ```tsx
 * <Alert tone="error" title="Couldn't save" action={<Button size="sm" onClick={retry}>Retry</Button>}>
 *   Check your connection and try again.
 * </Alert>
 * ```
 */
export function Alert({
  tone = "info",
  title,
  icon,
  action,
  onClose,
  className,
  classNames,
  children,
  ...props
}: AlertProps) {
  const Icon = ICONS[tone];
  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", TONES[tone], className)}
      {...props}
    >
      {icon !== false && (
        <span className={cn("mt-px shrink-0", classNames?.icon)} aria-hidden>
          {icon ?? <Icon size={18} />}
        </span>
      )}
      <div className={cn("min-w-0 flex-1 text-text-secondary", classNames?.content)}>
        {title && <p className={cn("font-semibold text-text-primary", classNames?.title)}>{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
      {action && <div className={cn("shrink-0 self-center", classNames?.action)}>{action}</div>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className={cn(
            "-mr-1 shrink-0 cursor-pointer rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current/40 focus-visible:outline-none",
            classNames?.close,
          )}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
