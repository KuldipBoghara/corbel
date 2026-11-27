"use client";

import { useId, type ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { FormField, Label, type FieldProps, type FieldSlot } from "./FormField.js";

export type RadioGroupSize = "sm" | "md" | "lg";
export type RadioGroupSlot = FieldSlot | "group" | "option" | "radio" | "optionLabel" | "optionDescription";

export interface RadioOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Smaller text under the label. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> extends FieldProps {
  options: readonly RadioOption<T>[];
  /** The chosen value; `""` or `null` for none. */
  value: T | "" | null;
  onChange: (value: T) => void;
  /** Native `name` shared by the radios (for forms). Generated if omitted. */
  name?: string;
  /** @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** @default "md" */
  size?: RadioGroupSize;
  disabled?: boolean;
  /** Id of the radiogroup. Generated if omitted. */
  id?: string;
  /** Styles the root. */
  className?: string;
  classNames?: Partial<Record<RadioGroupSlot, string>>;
}

// The checked state is a thick primary border around the card-coloured centre, so no extra dot element.
const RADIO: Record<RadioGroupSize, string> = {
  sm: "size-4 checked:border-[5px]",
  md: "size-[18px] checked:border-[5px]",
  lg: "size-6 checked:border-[7px]",
};

/**
 * A list of native radio buttons with a shared label, hint and error.
 * The browser handles the keyboard: Tab enters the group, arrow keys move and select.
 *
 * ```tsx
 * <RadioGroup
 *   label="Plan"
 *   value={plan}
 *   onChange={setPlan}
 *   options={[
 *     { value: "free", label: "Free" },
 *     { value: "pro", label: "Pro", description: "$9 / month" },
 *   ]}
 * />
 * ```
 */
export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  name,
  orientation = "vertical",
  size = "md",
  disabled,
  label,
  hint,
  error,
  required,
  optional,
  id,
  className,
  classNames,
}: RadioGroupProps<T>) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <FormField id={id} hint={hint} error={error} className={className} classNames={classNames}>
      {({ id: groupId, describedBy, invalid }) => (
        <>
          {label && (
            <Label id={`${groupId}-label`} required={required} optional={optional} className={classNames?.label}>
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
              "flex",
              orientation === "vertical" ? "flex-col gap-2.5" : "flex-wrap gap-x-5 gap-y-2",
              classNames?.group,
            )}
          >
            {options.map((option) => {
              const optionDisabled = disabled || option.disabled;
              const optionId = `${groupId}-${option.value}`;
              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className={cn(
                    "inline-flex items-start gap-2",
                    optionDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                    classNames?.option,
                  )}
                >
                  <input
                    type="radio"
                    id={optionId}
                    name={groupName}
                    value={option.value}
                    checked={option.value === value}
                    disabled={optionDisabled}
                    required={required}
                    aria-labelledby={`${optionId}-label`}
                    aria-describedby={option.description ? `${optionId}-description` : undefined}
                    onChange={() => onChange(option.value)}
                    className={cn(
                      "mt-0.5 shrink-0 appearance-none rounded-full border-2 bg-bg-card transition-all",
                      invalid ? "border-error" : "border-border-default",
                      "checked:border-primary",
                      "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:outline-none",
                      optionDisabled ? "cursor-not-allowed" : "cursor-pointer",
                      RADIO[size],
                      classNames?.radio,
                    )}
                  />
                  <span className="min-w-0">
                    <span
                      id={`${optionId}-label`}
                      className={cn("block text-sm text-text-primary select-none", classNames?.optionLabel)}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span
                        id={`${optionId}-description`}
                        className={cn("mt-0.5 block text-xs text-text-secondary", classNames?.optionDescription)}
                      >
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </FormField>
  );
}
