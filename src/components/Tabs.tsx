"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../utils/cn.js";

export type TabKey = string | number;

export interface TabItem<T extends TabKey = string> {
  value: T;
  label: ReactNode;
  /** Pill beside the label. Hidden when `undefined`. */
  count?: number;
  /** Shown before the label, coloured with the tab's state (use `currentColor` icons). */
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Shared tablist behaviour: roving tabindex plus Arrow / Home / End keys
 * (both axes, so it works for horizontal and vertical lists). Selection
 * follows focus. Used by Tabs and SideTabs; not exported from the package.
 */
export function useTabList<T extends TabKey>(
  items: readonly TabItem<T>[],
  value: T,
  onChange: (value: T) => void,
  id: string | undefined,
) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = items.findIndex((t) => t.value === value && !t.disabled);
  const focusable = selected >= 0 ? selected : items.findIndex((t) => !t.disabled);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const enabled = items.flatMap((t, i) => (t.disabled ? [] : [i]));
    if (!enabled.length) return;
    const pos = enabled.indexOf(refs.current.indexOf(e.target as HTMLButtonElement));
    const n = enabled.length;
    let next: number | undefined;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = enabled[(pos + 1) % n];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = enabled[pos <= 0 ? n - 1 : pos - 1];
        break;
      case "Home":
        next = enabled[0];
        break;
      case "End":
        next = enabled[n - 1];
        break;
      default:
        return;
    }
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next]!.value);
  };

  const tabProps = (tab: TabItem<T>, index: number) => {
    const active = index === selected;
    return {
      ref: (el: HTMLButtonElement | null) => {
        refs.current[index] = el;
      },
      type: "button" as const,
      role: "tab",
      id: id ? `${id}-tab-${tab.value}` : undefined,
      "aria-controls": id ? `${id}-panel-${tab.value}` : undefined,
      "aria-selected": active,
      tabIndex: index === focusable ? 0 : -1,
      disabled: tab.disabled,
      onClick: () => onChange(tab.value),
      active,
    };
  };

  return { onKeyDown, tabProps };
}

export type TabsSlot = "root" | "tab" | "icon" | "count";

export interface TabsProps<T extends TabKey = string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * Base id. When set, tab `i` gets `id="{id}-tab-{value}"` and
   * `aria-controls="{id}-panel-{value}"`; give your panel that id,
   * `role="tabpanel"` and `aria-labelledby="{id}-tab-{value}"`.
   */
  id?: string;
  /** @default "Sections" */
  "aria-label"?: string;
  className?: string;
  classNames?: Partial<Record<TabsSlot, string>>;
}

/**
 * Horizontal tabs with an underline on the active one.
 *
 * ```tsx
 * const [tab, setTab] = useState<"details" | "history">("details");
 * <Tabs items={[{ value: "details", label: "Details" }, { value: "history", label: "History", count: 4 }]}
 *       value={tab} onChange={setTab} />
 * ```
 */
export function Tabs<T extends TabKey = string>({
  items,
  value,
  onChange,
  id,
  "aria-label": ariaLabel = "Sections",
  className,
  classNames,
}: TabsProps<T>) {
  const { onKeyDown, tabProps } = useTabList(items, value, onChange, id);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-border-default",
        className,
        classNames?.root,
      )}
    >
      {items.map((tab, i) => {
        const { active, ...props } = tabProps(tab, i);
        return (
          <button
            key={tab.value}
            {...props}
            className={cn(
              "-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none focus-visible:ring-inset",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:border-border-default hover:text-text-primary",
              classNames?.tab,
            )}
          >
            {tab.icon && (
              <span
                className={cn(
                  "flex shrink-0",
                  active ? "text-primary" : "text-text-muted",
                  classNames?.icon,
                )}
                aria-hidden
              >
                {tab.icon}
              </span>
            )}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                  active ? "bg-primary-100 text-primary" : "bg-bg-main text-text-secondary",
                  classNames?.count,
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
