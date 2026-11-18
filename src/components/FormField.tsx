"use client";

import { useId, type ReactNode } from "react";
import { cn } from "../utils/cn.js";

/** Props shared by every form control that can show a label, hint and error. */
export interface FieldProps {
  /** Text above the control. */
  label?: ReactNode;
  /** Helper text under the control. Hidden while `error` is set. */
  hint?: ReactNode;
  /** Error message under the control. Also marks the control invalid. */
  error?: ReactNode;
  /** Shows a red asterisk after the label (and sets the native `required`). */
  required?: boolean;
  /** Shows "(optional)" after the label. */
  optional?: boolean;
}

export type FieldSlot = "root" | "label" | "hint" | "error";

export interface FormFieldProps extends FieldProps {
  /** Id of the control inside, so the label is clickable. Generated if omitted. */
  id?: string;
  /** Receives the ids to wire onto the control. */
  children: (ids: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => ReactNode;
  className?: string;
  classNames?: Partial<Record<FieldSlot, string>>;
}

/**
 * Label + control + hint/error, with the accessibility wiring done for you.
 *
 * Every built-in field uses it; use it yourself to give a custom control the
 * same layout:
 *
 * ```tsx
 * <FormField label="Colour" error={errors.colour}>
 *   {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} type="color" />}
 * </FormField>
 * ```
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required,
  optional,
  children,
  className,
  classNames,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("w-full", className, classNames?.root)}>
      {label && (
        <Label htmlFor={fieldId} required={required} optional={optional} className={classNames?.label}>
          {label}
        </Label>
      )}

      {children({ id: fieldId, describedBy, invalid: !!error })}

      {error ? (
        <p id={errorId} className={cn("mt-1.5 text-xs font-medium text-error", classNames?.error)}>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={cn("mt-1.5 text-xs text-text-secondary", classNames?.hint)}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

/** Form label with the required asterisk / "(optional)" marker. */
export function Label({ required, optional, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-semibold text-text-primary", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-error" aria-hidden>
          *
        </span>
      )}
      {optional && !required && (
        <span className="ml-1 font-normal text-text-muted">(optional)</span>
      )}
    </label>
  );
}
