"use client";

import { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";
import { fieldBaseClass, fieldErrorClass } from "./Input.js";
import { popoverClass, useAnchoredPopover } from "./DatePicker.js";

export type TimePickerSize = "sm" | "md" | "lg";
export type TimePickerSlot = FieldSlot | "popover";

export interface TimePickerProps extends FieldProps {
  /** 24-hour `HH:mm`, or `""` for no time. */
  value: string;
  /** Called with 24-hour `HH:mm`. */
  onChange: (value: string) => void;
  /** Display and pick in 12-hour (with AM/PM) or 24-hour form. The value is always 24-hour. @default 12 */
  hourCycle?: 12 | 24;
  /** Minutes between choices in the minute column. @default 1 */
  step?: number;
  /** @default "Select time" */
  placeholder?: string;
  disabled?: boolean;
  /** @default "md" */
  size?: TimePickerSize;
  id?: string;
  /** Renders a hidden input with the `HH:mm` value, for native form submission. */
  name?: string;
  /** Where the panel is portalled. @default document.body */
  container?: HTMLElement | null;
  /** Styles the trigger button. */
  className?: string;
  classNames?: Partial<Record<TimePickerSlot, string>>;
}

const SIZES: Record<TimePickerSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-3.5",
  lg: "h-11 px-4",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Splits `HH:mm` into numbers. Null if empty or out of range. */
export function parseTime(value: string): { hours: number; minutes: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const hours = +m[1]!;
  const minutes = +m[2]!;
  return hours < 24 && minutes < 60 ? { hours, minutes } : null;
}

/** `"14:05"` → `"02:05 PM"` (12) or `"14:05"` (24). */
export function formatTime(value: string, hourCycle: 12 | 24 = 12): string {
  const t = parseTime(value);
  if (!t) return "";
  if (hourCycle === 24) return `${pad(t.hours)}:${pad(t.minutes)}`;
  return `${pad(t.hours % 12 || 12)}:${pad(t.minutes)} ${t.hours < 12 ? "AM" : "PM"}`;
}

/** 12-hour parts → 24-hour hours: (12, "AM") → 0, (12, "PM") → 12, (2, "PM") → 14. */
export const to24Hour = (hour12: number, period: "AM" | "PM") => (hour12 % 12) + (period === "PM" ? 12 : 0);

/**
 * Time field with hour / minute (/ AM-PM) columns. The value is always 24-hour
 * `HH:mm`; `hourCycle` only changes what is shown. Forwards its ref to the trigger button.
 *
 * ```tsx
 * <TimePicker label="Start" value={start} onChange={setStart} step={15} />
 * ```
 */
export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(function TimePicker(
  {
    value,
    onChange,
    hourCycle = 12,
    step = 1,
    label,
    hint,
    error,
    required,
    optional,
    placeholder = "Select time",
    disabled = false,
    size = "md",
    id,
    name,
    container,
    className,
    classNames,
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const { anchorRef, popoverRef, style } = useAnchoredPopover(open && !disabled, setOpen);

  const { hours, minutes } = parseTime(value) ?? { hours: 0, minutes: 0 };
  const is12 = hourCycle === 12;
  const period = hours < 12 ? "AM" : "PM";
  const emit = (h: number, m: number) => onChange(`${pad(h)}:${pad(m)}`);

  const hourList = is12 ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i);
  const minuteList = Array.from({ length: Math.ceil(60 / Math.max(1, step)) }, (_, i) => i * Math.max(1, step));

  // Scroll each column so its active item is in view.
  useEffect(() => {
    if (!open) return;
    popoverRef.current?.querySelectorAll<HTMLElement>("[aria-pressed=true]").forEach((el) => {
      const col = el.parentElement!;
      col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.offsetHeight / 2;
    });
  }, [open, popoverRef]);

  const column = (title: string, items: { key: string; active: boolean; onPick: () => void }[]) => (
    <div role="group" aria-label={title} className="corbel-scrollbar relative flex flex-1 flex-col gap-0.5 overflow-y-auto px-0.5">
      <div className="sticky top-0 bg-bg-card py-0.5 text-center text-[10px] font-bold text-text-muted uppercase">
        {title}
      </div>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          aria-pressed={it.active}
          onClick={it.onPick}
          className={cn(
            "flex h-8 shrink-0 cursor-pointer items-center justify-center rounded text-xs font-semibold transition-colors",
            "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
            it.active ? "bg-primary text-primary-contrast" : "text-text-primary hover:bg-primary-50 hover:text-primary",
          )}
        >
          {it.key}
        </button>
      ))}
    </div>
  );

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
      {({ id: buttonId, describedBy, invalid }) => (
        <div ref={anchorRef}>
          <button
            ref={ref}
            id={buttonId}
            type="button"
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              fieldBaseClass,
              "flex cursor-pointer items-center justify-between gap-2 text-left",
              SIZES[size],
              invalid && fieldErrorClass,
              className,
            )}
          >
            <span className={cn("truncate", !value && "text-text-muted")}>
              {formatTime(value, hourCycle) || placeholder}
            </span>
            <Clock size={16} className="shrink-0 text-text-muted" aria-hidden />
          </button>
          {name && <input type="hidden" name={name} value={value} />}

          {open &&
            !disabled &&
            createPortal(
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Choose a time"
                style={style}
                className={cn(popoverClass, "flex h-52 w-56 gap-1 p-2", classNames?.popover)}
              >
                {column(
                  "Hour",
                  hourList.map((h) => ({
                    key: pad(h),
                    active: !!value && (is12 ? h === (hours % 12 || 12) : h === hours),
                    onPick: () => emit(is12 ? to24Hour(h, period) : h, minutes),
                  })),
                )}
                {column(
                  "Min",
                  minuteList.map((m) => ({ key: pad(m), active: !!value && m === minutes, onPick: () => emit(hours, m) })),
                )}
                {is12 &&
                  column(
                    "AM/PM",
                    (["AM", "PM"] as const).map((p) => ({
                      key: p,
                      active: !!value && p === period,
                      onPick: () => emit(to24Hour(hours % 12 || 12, p), minutes),
                    })),
                  )}
              </div>,
              container ?? document.body,
            )}
        </div>
      )}
    </FormField>
  );
});
