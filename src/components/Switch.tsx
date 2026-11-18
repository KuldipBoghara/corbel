"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { Spinner } from "./Feedback.js";

export type SwitchSize = "sm" | "md" | "lg";
export type SwitchSlot = "root" | "track" | "thumb" | "label" | "description";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "checked" | "onChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** Text next to the switch. */
  label?: ReactNode;
  /** Smaller text under the label. */
  description?: ReactNode;
  /** Shows a spinner in the thumb and blocks toggling, e.g. while saving. */
  loading?: boolean;
  /** @default "md" */
  size?: SwitchSize;
  /** Styles the root `<label>`. */
  className?: string;
  classNames?: Partial<Record<SwitchSlot, string>>;
}

const TRACK: Record<SwitchSize, string> = { sm: "h-5 w-9", md: "h-6 w-11", lg: "h-7 w-13" };
const THUMB: Record<SwitchSize, string> = { sm: "size-4", md: "size-5", lg: "size-6" };
const ON: Record<SwitchSize, string> = { sm: "translate-x-4", md: "translate-x-5", lg: "translate-x-6" };
const SPINNER: Record<SwitchSize, number> = { sm: 10, md: 12, lg: 14 };

/**
 * On/off toggle. A native checkbox with `role="switch"` sits under the track,
 * so it works with the keyboard (Space) and screen readers, and gets the ref.
 *
 * ```tsx
 * <Switch label="Email alerts" checked={alerts} onChange={setAlerts} />
 * ```
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    checked,
    onChange,
    label,
    description,
    loading = false,
    size = "md",
    disabled,
    id,
    className,
    classNames,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const inactive = disabled || loading;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-3",
        inactive ? "cursor-not-allowed" : "cursor-pointer",
        disabled && "opacity-50",
        className,
        classNames?.root,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={inputId}
        checked={checked}
        disabled={inactive}
        aria-busy={loading || undefined}
        aria-describedby={descriptionId}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-border-default",
          TRACK[size],
          classNames?.track,
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-white shadow-sm transition-transform",
            THUMB[size],
            checked && ON[size],
            classNames?.thumb,
          )}
        >
          {loading && <Spinner size={SPINNER[size]} />}
        </span>
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <span className={cn("block text-sm text-text-primary select-none", classNames?.label)}>
              {label}
            </span>
          )}
          {description && (
            <span
              id={descriptionId}
              className={cn("mt-0.5 block text-xs text-text-secondary", classNames?.description)}
            >
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
