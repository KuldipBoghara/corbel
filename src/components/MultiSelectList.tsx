"use client";

import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";

export type MultiSelectListSlot = FieldSlot | "list" | "item" | "clear";

export interface MultiSelectOption<V = string> {
  value: V;
  label: ReactNode;
  /** Muted text after the label. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectListProps<V = string> extends FieldProps {
  options: MultiSelectOption<V>[];
  value: V[];
  onChange: (value: V[]) => void;
  /** @default "Nothing to choose from." */
  emptyMessage?: ReactNode;
  disabled?: boolean;
  /** Shows a "Clear (n)" button beside the label. @default true */
  clearable?: boolean;
  id?: string;
  /** Styles the root. */
  className?: string;
  classNames?: Partial<Record<MultiSelectListSlot, string>>;
}

/**
 * Scrollable checkbox list for small sets where every option should stay
 * visible (departments, wards, roles). For long or server-paged sets use
 * `SearchSelectList`.
 *
 * ```tsx
 * <MultiSelectList label="Departments" options={departments} value={ids} onChange={setIds} />
 * ```
 */
export function MultiSelectList<V = string>({
  options,
  value,
  onChange,
  emptyMessage = "Nothing to choose from.",
  disabled = false,
  clearable = true,
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  classNames,
}: MultiSelectListProps<V>) {
  const toggle = (v: V) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={cn("relative", className)}
      classNames={classNames}
    >
      {({ id: listId, describedBy, invalid }) => (
        <>
          {clearable && value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              disabled={disabled}
              className={cn(
                "absolute top-0 right-0 cursor-pointer text-[11px] font-semibold text-text-muted hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50",
                classNames?.clear,
              )}
            >
              Clear ({value.length})
            </button>
          )}
          <div
            id={listId}
            role="group"
            aria-label={typeof label === "string" ? label : undefined}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={cn(
              "corbel-scrollbar max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border-default bg-bg-card p-2.5",
              invalid && "border-error",
              disabled && "opacity-60",
              classNames?.list,
            )}
          >
            {options.length === 0 ? (
              <p className="px-1 py-2 text-xs text-text-muted">{emptyMessage}</p>
            ) : (
              options.map((o) => (
                <label
                  key={String(o.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 text-sm text-text-primary",
                    (disabled || o.disabled) && "cursor-not-allowed opacity-50",
                    classNames?.item,
                  )}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(o.value)}
                    disabled={disabled || o.disabled}
                    onChange={() => toggle(o.value)}
                    className="size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
                  />
                  <span className="min-w-0 truncate">
                    {o.label}
                    {o.description && <span className="ml-1.5 text-text-muted">· {o.description}</span>}
                  </span>
                </label>
              ))
            )}
          </div>
        </>
      )}
    </FormField>
  );
}
