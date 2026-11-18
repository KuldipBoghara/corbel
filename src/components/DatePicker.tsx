"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";
import { fieldErrorClass } from "./Input.js";

export type DatePickerSize = "sm" | "md" | "lg";
export type DatePickerSlot = FieldSlot | "popover";

export interface DatePickerProps extends FieldProps {
  /** `YYYY-MM-DD`, or `""` for no date. */
  value: string;
  /** Called with `YYYY-MM-DD`, or `""` when cleared. */
  onChange: (value: string) => void;
  /** Earliest selectable date, `YYYY-MM-DD`. */
  min?: string;
  /** Latest selectable date, `YYYY-MM-DD`. */
  max?: string;
  /** @default "DD/MM/YYYY" */
  placeholder?: string;
  disabled?: boolean;
  /** @default "md" */
  size?: DatePickerSize;
  id?: string;
  /** Renders a hidden input with the `YYYY-MM-DD` value, for native form submission. */
  name?: string;
  onBlur?: () => void;
  /** Where the calendar is portalled. @default document.body */
  container?: HTMLElement | null;
  /** Styles the field box. */
  className?: string;
  classNames?: Partial<Record<DatePickerSlot, string>>;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const SIZES: Record<DatePickerSize, string> = { sm: "h-8 text-xs", md: "h-10 text-sm", lg: "h-11 text-sm" };

/** Parses `YYYY-MM-DD` into a local Date (no timezone shift). Null if empty or impossible. */
export function parseISODate(value: string | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!m) return null;
  return validDate(+m[1]!, +m[2]!, +m[3]!);
}

/** Parses typed `DD/MM/YYYY` (also `-` or `.` separators). Null for impossible dates like 31/02. */
export function parseTypedDate(value: string): Date | null {
  const parts = value.trim().split(/[/\-.]/);
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number) as [number, number, number];
  if (y < 1900 || y > 2100) return null;
  return validDate(y, m, d);
}

function validDate(y: number, m: number, d: number): Date | null {
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

export function toISODate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

const display = (date: Date | null) => {
  if (!date) return "";
  const [y, m, d] = toISODate(date).split("-");
  return `${d}/${m}/${y}`;
};

/** Month cells, Monday first, padded with nulls. */
function buildGrid(year: number, month: number): (number | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days: (number | null)[] = Array(offset).fill(null);
  const last = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= last; d++) days.push(d);
  while (days.length % 7) days.push(null);
  return days;
}

const GAP = 6;
const EDGE = 8;

/**
 * Positions a portalled popover under `anchorRef` (flipping above when short of
 * room), keeps it there on scroll/resize, and closes it on outside click or Escape.
 * Shared by DatePicker and TimePicker; not part of the public API.
 */
export function useAnchoredPopover(open: boolean, setOpen: Dispatch<SetStateAction<boolean>>) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const update = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = popoverRef.current?.offsetHeight ?? 0;
    const width = popoverRef.current?.offsetWidth ?? 0;
    let top = rect.bottom + GAP;
    if (top + height > window.innerHeight - EDGE) {
      const above = rect.top - height - GAP;
      top = above >= EDGE ? above : Math.max(EDGE, window.innerHeight - height - EDGE);
    }
    const left = Math.max(EDGE, Math.min(rect.left, window.innerWidth - width - EDGE));
    setCoords({ top, left });
  }, []);

  // Before paint, so the popover never flashes in the wrong place.
  useLayoutEffect(() => {
    if (open) update();
    else setCoords(null);
  }, [open, update]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Capture phase catches scrolling inside a modal body, not just the window.
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, update, setOpen]);

  const style: CSSProperties = {
    top: coords?.top ?? 0,
    left: coords?.left ?? 0,
    // Hidden until measured, so it never appears top-left first.
    visibility: coords ? "visible" : "hidden",
  };
  return { anchorRef, popoverRef, style };
}

/** Classes for the floating panel of DatePicker and TimePicker. */
export const popoverClass =
  "fixed z-[60] rounded-xl border border-border-default bg-bg-card shadow-2xl animate-corbel-fade-in";

/**
 * Date field: type `DD/MM/YYYY` or pick from a calendar. The value is always
 * `YYYY-MM-DD`, like a native date input. The calendar is portalled, so it is
 * never clipped inside a scrolling Modal. Forwards its ref to the text input.
 *
 * ```tsx
 * <DatePicker label="Due date" value={due} onChange={setDue} min={today} />
 * ```
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value,
    onChange,
    min,
    max,
    label,
    hint,
    error,
    required,
    optional,
    placeholder = "DD/MM/YYYY",
    disabled = false,
    size = "md",
    id,
    name,
    onBlur,
    container,
    className,
    classNames,
  },
  ref,
) {
  const selected = parseISODate(value);
  const minDate = parseISODate(min);
  const maxDate = parseISODate(max);
  const inRange = (d: Date) => (!minDate || d >= minDate) && (!maxDate || d <= maxDate);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(display(selected));
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const { anchorRef, popoverRef, style } = useAnchoredPopover(open && !disabled, setOpen);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusOnOpen = useRef(false);

  // Follow outside changes to the value.
  useEffect(() => setText(display(parseISODate(value))), [value]);

  // Open on the selected month, not wherever the user last browsed.
  useEffect(() => {
    if (!open) return;
    const base = parseISODate(value) ?? new Date();
    setView({ year: base.getFullYear(), month: base.getMonth() });
  }, [open, value]);

  // Opened from the keyboard: move focus onto the selected (or today's, or first) day.
  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    const panel = popoverRef.current;
    (
      panel?.querySelector<HTMLButtonElement>('[aria-pressed="true"]:enabled') ??
      panel?.querySelector<HTMLButtonElement>('[aria-current="date"]:enabled') ??
      panel?.querySelector<HTMLButtonElement>("[aria-pressed]:enabled")
    )?.focus();
  }, [open, popoverRef]);

  const commit = (date: Date | null) => {
    onChange(date ? toISODate(date) : "");
    setText(display(date));
  };

  /** Accepts the typed text, clears on empty, otherwise reverts. */
  const commitTyped = () => {
    if (text.trim() === "") {
      if (value) commit(null);
      return;
    }
    const parsed = parseTypedDate(text);
    if (parsed && inRange(parsed)) {
      if (toISODate(parsed) !== value) commit(parsed);
      else setText(display(parsed));
    } else setText(display(selected));
  };

  const pick = (date: Date | null) => {
    commit(date);
    setOpen(false);
    inputRef.current?.focus();
  };

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sameDay = (a: Date | null, day: number) =>
    !!a && a.getFullYear() === view.year && a.getMonth() === view.month && a.getDate() === day;

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
        <div
          ref={anchorRef}
          className={cn(
            "flex w-full items-center overflow-hidden rounded-lg border border-border-default bg-bg-card text-text-primary transition-colors",
            "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
            open && "border-primary ring-2 ring-primary/20",
            SIZES[size],
            invalid && cn(fieldErrorClass, "focus-within:border-error focus-within:ring-error/20"),
            disabled && "cursor-not-allowed bg-bg-main text-text-muted",
            className,
          )}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close calendar" : "Open calendar"}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex h-full shrink-0 cursor-pointer items-center px-3 text-text-muted transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none disabled:cursor-not-allowed"
          >
            <CalendarDays size={15} className={cn(open && "text-primary")} />
          </button>
          <span className="h-5 w-px shrink-0 bg-border-default" />
          <input
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              commitTyped();
              onBlur?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitTyped();
                setOpen(false);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                focusOnOpen.current = true;
                setOpen(true);
              }
            }}
            className="h-full min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
          />
          {name && <input type="hidden" name={name} value={value} />}

          {open &&
            !disabled &&
            createPortal(
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Choose a date"
                style={style}
                onKeyDown={(e) => {
                  if (e.key === "Escape") inputRef.current?.focus();
                }}
                className={cn(popoverClass, "w-[284px] p-3", classNames?.popover)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                    className="cursor-pointer rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-main hover:text-text-primary"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-sm font-semibold text-text-primary select-none" aria-live="polite">
                    {MONTHS[view.month]} {view.year}
                  </span>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                    className="cursor-pointer rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-main hover:text-text-primary"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="mb-1 grid grid-cols-7" aria-hidden>
                  {WEEKDAYS.map((wd) => (
                    <div key={wd} className="py-1 text-center text-[11px] font-semibold text-text-muted select-none">
                      {wd}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-0.5">
                  {buildGrid(view.year, view.month).map((day, i) => {
                    if (!day) return <span key={i} />;
                    const date = new Date(view.year, view.month, day);
                    const sel = sameDay(selected, day);
                    const tod = sameDay(today, day);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => pick(date)}
                        disabled={!inRange(date)}
                        aria-label={display(date)}
                        aria-pressed={sel}
                        aria-current={tod ? "date" : undefined}
                        className={cn(
                          "relative flex h-9 w-full cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors",
                          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                          "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
                          sel
                            ? "bg-primary text-primary-contrast shadow-sm"
                            : tod
                              ? "bg-primary-50 text-primary hover:bg-primary-100"
                              : "text-text-primary hover:bg-bg-main",
                        )}
                      >
                        {day}
                        {tod && !sel && (
                          <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border-default pt-2.5">
                  <button
                    type="button"
                    onClick={() => pick(null)}
                    disabled={!value}
                    className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-main hover:text-text-primary disabled:invisible"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => pick(today)}
                    disabled={!inRange(today)}
                    className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Today
                  </button>
                </div>
              </div>,
              container ?? document.body,
            )}
        </div>
      )}
    </FormField>
  );
});
