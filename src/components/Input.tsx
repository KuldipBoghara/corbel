"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, FieldProps {
  /** @default "md" */
  size?: InputSize;
  /** Icon inside the field, on the left. */
  startIcon?: ReactNode;
  /** Icon inside the field, on the right. Ignored for `type="password"`, which shows a reveal toggle. */
  endIcon?: ReactNode;
  /** Styles the `<input>` itself. Use `classNames` for the other parts. */
  className?: string;
  classNames?: Partial<Record<FieldSlot, string>>;
}

/** Shared look of every text-like control (Input, TextArea, SearchBar, DatePicker …). */
export const fieldBaseClass = cn(
  "w-full rounded-lg border border-border-default bg-bg-card text-sm text-text-primary transition-colors",
  "placeholder:text-text-muted",
  "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
  "disabled:cursor-not-allowed disabled:bg-bg-main disabled:text-text-muted",
);
export const fieldErrorClass = "border-error focus:border-error focus:ring-error/20";

const SIZES: Record<InputSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-3.5",
  lg: "h-11 px-4",
};

/**
 * Text input with label, hint, error and icons. Forwards its ref to the
 * `<input>`, so it works with react-hook-form `register` and Formik alike.
 *
 * ```tsx
 * <Input label="Email" type="email" required error={errors.email} {...register("email")} />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    required,
    optional,
    size = "md",
    startIcon,
    endIcon,
    type = "text",
    id,
    className,
    classNames,
    ...props
  },
  ref,
) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const trailing = isPassword ? null : endIcon;

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
      {({ id: inputId, describedBy, invalid }) => (
        <div className="relative">
          {startIcon && (
            <span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-text-muted">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && revealed ? "text" : type}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              fieldBaseClass,
              SIZES[size],
              startIcon && "pl-10",
              (trailing || isPassword) && "pr-10",
              invalid && fieldErrorClass,
              className,
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-secondary"
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            trailing && (
              <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 text-text-muted">
                {trailing}
              </span>
            )
          )}
        </div>
      )}
    </FormField>
  );
});
