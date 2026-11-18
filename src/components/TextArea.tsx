"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";
import { fieldBaseClass, fieldErrorClass } from "./Input.js";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {
  /** Styles the `<textarea>` itself. Use `classNames` for the other parts. */
  className?: string;
  classNames?: Partial<Record<FieldSlot, string>>;
}

/**
 * Multi-line text field with the same label, hint, error and focus styling as
 * `Input`. Forwards its ref to the `<textarea>`.
 *
 * ```tsx
 * <TextArea label="Notes" rows={4} optional {...register("notes")} />
 * ```
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hint, error, required, optional, rows = 3, id, className, classNames, ...props },
  ref,
) {
  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      classNames={classNames}
    >
      {({ id: fieldId, describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(fieldBaseClass, "block px-3.5 py-2.5", invalid && fieldErrorClass, className)}
          {...props}
        />
      )}
    </FormField>
  );
});
