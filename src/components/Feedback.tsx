"use client";

import type { ReactNode } from "react";
import { CircleAlert, Inbox, LoaderCircle, WifiOff } from "lucide-react";
import { cn } from "../utils/cn.js";
import { Button } from "./Button.js";

export interface SpinnerProps {
  /** Pixel size. @default 20 */
  size?: number;
  className?: string;
  /** Accessible label. Omit when the spinner sits next to visible text. */
  label?: string;
}

/** Spinning loader icon in the primary colour. */
export function Spinner({ size = 20, className, label }: SpinnerProps) {
  return (
    <LoaderCircle
      size={size}
      className={cn("shrink-0 animate-spin text-primary", className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

export type EmptyStateSlot = "root" | "icon" | "title" | "message" | "action";

export interface EmptyStateProps {
  /** @default "Nothing here yet" */
  title?: ReactNode;
  message?: ReactNode;
  /** Replaces the default inbox icon. */
  icon?: ReactNode;
  /** A button or link shown under the message. */
  action?: ReactNode;
  className?: string;
  classNames?: Partial<Record<EmptyStateSlot, string>>;
}

/** What a list shows when it has no rows. */
export function EmptyState({
  title = "Nothing here yet",
  message,
  icon,
  action,
  className,
  classNames,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-14 text-center",
        className,
        classNames?.root,
      )}
    >
      <div
        className={cn(
          "mb-3 flex size-12 items-center justify-center rounded-2xl bg-bg-main text-text-muted",
          classNames?.icon,
        )}
      >
        {icon ?? <Inbox size={22} />}
      </div>
      <h3 className={cn("text-sm font-bold text-text-primary", classNames?.title)}>{title}</h3>
      {message && (
        <p className={cn("mt-1 max-w-sm text-sm text-text-secondary", classNames?.message)}>
          {message}
        </p>
      )}
      {action && <div className={cn("mt-4", classNames?.action)}>{action}</div>}
    </div>
  );
}

export interface ErrorStateProps extends Omit<EmptyStateProps, "action"> {
  /** Shows a "Try again" button that calls this. */
  onRetry?: () => void;
  /** @default "Try again" */
  retryLabel?: ReactNode;
  /** Shows the offline icon instead of the alert icon. */
  offline?: boolean;
}

/** What a list or panel shows when loading its data failed. */
export function ErrorState({
  title = "Something went wrong",
  message,
  icon,
  onRetry,
  retryLabel = "Try again",
  offline = false,
  className,
  classNames,
}: ErrorStateProps) {
  return (
    <div role="alert" className="contents">
      <EmptyState
        title={title}
        message={message}
        icon={icon ?? (offline ? <WifiOff size={22} /> : <CircleAlert size={22} />)}
        className={className}
        classNames={{ ...classNames, icon: cn("bg-error/10 text-error", classNames?.icon) }}
        action={
          onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          )
        }
      />
    </div>
  );
}
