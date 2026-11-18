"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";
import { fieldBaseClass, fieldErrorClass } from "./Input.js";

export type OtpInputSlot = FieldSlot | "group" | "input";

export interface OtpInputProps extends FieldProps {
  /** The digits entered so far, e.g. `"12"`. */
  value: string;
  onChange: (value: string) => void;
  /** Called once all `length` digits are filled in. */
  onComplete?: (value: string) => void;
  /** Number of digit boxes. @default 6 */
  length?: number;
  disabled?: boolean;
  /** Focuses the first box on mount. */
  autoFocus?: boolean;
  /** Id of the first box (the label points at it). Generated if omitted. */
  id?: string;
  /** Styles the root. */
  className?: string;
  classNames?: Partial<Record<OtpInputSlot, string>>;
}

/**
 * One-time-code entry: one box per digit, with auto-advance, paste and SMS
 * autofill of the whole code, Backspace to go back and arrow-key navigation.
 * The forwarded ref points at the first box.
 *
 * Digits always fill from the left: clicking an empty box past the first gap
 * jumps to the gap, and deleting a middle digit shifts the later ones left.
 *
 * ```tsx
 * <OtpInput label="Verification code" value={code} onChange={setCode} onComplete={verify} />
 * ```
 */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  {
    value,
    onChange,
    onComplete,
    length = 6,
    disabled,
    autoFocus,
    label,
    hint,
    error,
    required,
    optional,
    id,
    className,
    classNames,
  },
  ref,
) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  useImperativeHandle(ref, () => inputs.current[0]!);

  // Updated before focus moves, so onFocus never sees the stale `value` prop.
  const latest = useRef(value);
  latest.current = value;

  const chars = Array.from({ length }, (_, i) => value[i] ?? "");
  const focus = (i: number) => inputs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  /** Writes `digits` from box `start` onward (or clears box `start` when empty). */
  const fill = (start: number, digits: string) => {
    const next = [...chars];
    if (digits) for (let k = 0; k < digits.length && start + k < length; k++) next[start + k] = digits[k]!;
    else next[start] = "";
    const nextValue = next.join("");
    latest.current = nextValue;
    if (nextValue !== value) {
      onChange(nextValue);
      if (nextValue.length === length) onComplete?.(nextValue);
    }
    focus(start + digits.length);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      e.preventDefault();
      fill(i - 1, "");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (digits) fill(digits.length >= length ? 0 : i, digits);
  };

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
      {({ id: firstId, describedBy, invalid }) => (
        <div
          role="group"
          aria-label={typeof label === "string" ? label : undefined}
          className={cn("flex items-center gap-2 sm:gap-3", classNames?.group)}
        >
          {chars.map((char, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              id={i === 0 ? firstId : undefined}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoFocus={autoFocus && i === 0}
              aria-label={`Digit ${i + 1} of ${length}`}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              required={required}
              disabled={disabled}
              value={char}
              onFocus={(e) => (i > latest.current.length ? focus(latest.current.length) : e.target.select())}
              onChange={(e) => {
                let digits = e.target.value.replace(/\D/g, "");
                // Typing into a filled box leaves two digits; keep the new one.
                if (char && digits.length > 1) digits = digits.replace(char, "");
                fill(i, digits);
              }}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={(e) => onPaste(i, e)}
              className={cn(
                fieldBaseClass,
                "size-12 px-0 text-center text-lg font-semibold sm:size-14",
                invalid && fieldErrorClass,
                classNames?.input,
              )}
            />
          ))}
        </div>
      )}
    </FormField>
  );
});
