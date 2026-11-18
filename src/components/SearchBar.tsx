"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Search, X } from "lucide-react";
import { cn } from "../utils/cn.js";
import { fieldBaseClass } from "./Input.js";

export type SearchBarSlot = "root" | "icon" | "clear";

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /**
   * Waits this many ms after the last keystroke before calling `onChange`.
   * The field still updates instantly. Clearing is never delayed. Off by default.
   */
  debounceMs?: number;
  /** @default "Search…" */
  placeholder?: string;
  /** @default "Search" */
  "aria-label"?: string;
  /** Styles the `<input>` itself. Use `classNames` for the other parts. */
  className?: string;
  classNames?: Partial<Record<SearchBarSlot, string>>;
}

/**
 * Search field with a search icon, a clear button and optional debounce.
 * Forwards its ref to the `<input>`.
 *
 * ```tsx
 * <SearchBar value={query} onChange={setQuery} debounceMs={300} />
 * ```
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    value,
    onChange,
    debounceMs,
    placeholder = "Search…",
    "aria-label": ariaLabel = "Search",
    disabled,
    className,
    classNames,
    ...props
  },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current!);

  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setText(value), [value]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const emit = (next: string, immediate = false) => {
    setText(next);
    clearTimeout(timer.current);
    if (!debounceMs || immediate) onChange(next);
    else timer.current = setTimeout(() => onChange(next), debounceMs);
  };

  return (
    <div className={cn("relative w-full", classNames?.root)}>
      <Search
        size={16}
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted",
          classNames?.icon,
        )}
      />
      <input
        ref={inner}
        type="search"
        value={text}
        onChange={(e) => emit(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          fieldBaseClass,
          "h-10 pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none",
          className,
        )}
        {...props}
      />
      {text && !disabled && (
        <button
          type="button"
          onClick={() => {
            emit("", true);
            inner.current?.focus();
          }}
          aria-label="Clear search"
          className={cn(
            "absolute top-1/2 right-2.5 flex -translate-y-1/2 cursor-pointer rounded p-0.5 text-text-muted hover:text-text-secondary",
            "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
            classNames?.clear,
          )}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});
