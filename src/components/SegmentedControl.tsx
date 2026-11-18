"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { FormField, Label, type FieldProps, type FieldSlot } from "./FormField.js";

export type SegmentedControlTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";
export type SegmentedControlSlot = FieldSlot | "group" | "option";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Shown under the control while this option is chosen (replaces `hint`). */
  hint?: ReactNode;
  /**
   * Colours the option while it is chosen. Use it when the answers are not
   * equivalent ("no impact" vs "patient affected"), so they don't look alike.
   */
  tone?: SegmentedControlTone;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> extends FieldProps {
  options: readonly SegmentedOption<T>[];
  /** The chosen value; `""` or `null` for none. */
  value: T | "" | null;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Id of the radiogroup. Generated if omitted. */
  id?: string;
  /** Styles the root. */
  className?: string;
  classNames?: Partial<Record<SegmentedControlSlot, string>>;
}

const TONES: Record<SegmentedControlTone, string> = {
  neutral: "bg-bg-card text-text-primary shadow-sm",
  primary: "bg-primary-50 text-primary ring-1 ring-primary/30",
  success: "bg-success/10 text-success ring-1 ring-success/30",
  warning: "bg-warning/10 text-warning ring-1 ring-warning/30",
  error: "bg-error/10 text-error ring-1 ring-error/30",
  info: "bg-info/10 text-info ring-1 ring-info/30",
};

/**
 * A short, mutually exclusive choice shown as a row of buttons (a radiogroup).
 * Arrow keys move and select, Home/End jump to the ends. For more than a
 * handful of options use a dropdown.
 *
 * ```tsx
 * <SegmentedControl
 *   label="Usable?"
 *   value={status}
 *   onChange={setStatus}
 *   options={[
 *     { value: "yes", label: "Yes", tone: "success" },
 *     { value: "no", label: "No", tone: "error" },
 *   ]}
 * />
 * ```
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
  label,
  hint,
  error,
  required,
  optional,
  id,
  className,
  classNames,
}: SegmentedControlProps<T>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const chosen = options.find((o) => o.value === value);
  const enabled = options.flatMap((o, i) => (disabled || o.disabled ? [] : [i]));
  // Roving tabindex: Tab lands on the chosen option, or the first enabled one.
  const tabStop = chosen && enabled.includes(options.indexOf(chosen)) ? options.indexOf(chosen) : enabled[0];

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const pos = enabled.indexOf(index);
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let target: number | undefined;
    if (e.key in step) target = enabled[(pos + step[e.key]! + enabled.length) % enabled.length];
    else if (e.key === "Home") target = enabled[0];
    else if (e.key === "End") target = enabled[enabled.length - 1];
    if (target === undefined) return;
    e.preventDefault();
    buttons.current[target]?.focus();
    onChange(options[target]!.value);
  };

  return (
    <FormField
      id={id}
      hint={chosen?.hint ?? hint}
      error={error}
      className={className}
      classNames={classNames}
    >
      {({ id: groupId, describedBy, invalid }) => (
        <>
          {label && (
            <Label
              id={`${groupId}-label`}
              required={required}
              optional={optional}
              className={classNames?.label}
            >
              {label}
            </Label>
          )}
          <div
            id={groupId}
            role="radiogroup"
            aria-labelledby={label ? `${groupId}-label` : undefined}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            className={cn(
              "inline-flex w-full gap-1 rounded-lg border border-border-default bg-bg-main p-1",
              invalid && "border-error",
              classNames?.group,
            )}
          >
            {options.map((option, i) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={i === tabStop ? 0 : -1}
                  disabled={disabled || option.disabled}
                  onClick={() => onChange(option.value)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    active ? TONES[option.tone ?? "neutral"] : "text-text-secondary hover:text-text-primary",
                    classNames?.option,
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </FormField>
  );
}
