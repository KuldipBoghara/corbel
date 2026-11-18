"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../utils/cn.js";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxSlot = "root" | "box" | "label" | "description";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Text next to the box. */
  label?: ReactNode;
  /** Smaller text under the label. */
  description?: ReactNode;
  /** Shows a dash instead of a tick, e.g. for "some children selected". */
  indeterminate?: boolean;
  /** @default "md" */
  size?: CheckboxSize;
  /** Styles the root `<label>`. */
  className?: string;
  classNames?: Partial<Record<CheckboxSlot, string>>;
}

const BOX: Record<CheckboxSize, string> = { sm: "size-4", md: "size-[18px]", lg: "size-6" };
const ICON: Record<CheckboxSize, number> = { sm: 11, md: 13, lg: 16 };

/**
 * Checkbox with optional label, description and indeterminate state. The
 * native input stays in the DOM (keyboard, screen readers, forms) under the
 * styled box, and receives the forwarded ref.
 *
 * ```tsx
 * <Checkbox label="Select all" checked={all} indeterminate={some} onChange={(e) => toggleAll(e.target.checked)} />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, size = "md", disabled, id, className, classNames, ...props },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current!);
  // The native flag has no attribute and a click clears it, so re-apply it every render.
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  });

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-start gap-2",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
        classNames?.root,
      )}
    >
      <span className={cn("relative mt-0.5 flex shrink-0", BOX[size], classNames?.box)}>
        <input
          ref={inner}
          type="checkbox"
          id={inputId}
          disabled={disabled}
          aria-describedby={descriptionId}
          className={cn(
            "peer size-full appearance-none rounded border-2 border-border-default bg-bg-card transition-colors",
            "checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary",
            "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:outline-none",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center text-primary-contrast",
            "opacity-0 peer-checked:opacity-100",
            indeterminate && "opacity-100",
          )}
        >
          {indeterminate ? (
            <Minus size={ICON[size]} strokeWidth={3.5} />
          ) : (
            <Check size={ICON[size]} strokeWidth={3.5} />
          )}
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
