"use client";

import { cn } from "../utils/cn.js";
import { useTabList, type TabItem, type TabKey, type TabsProps } from "./Tabs.js";

export type SideTabsSlot = "root" | "tab" | "icon" | "label" | "count";

export interface SideTabsProps<T extends TabKey = string>
  extends Omit<TabsProps<T>, "classNames"> {
  classNames?: Partial<Record<SideTabsSlot, string>>;
}

/**
 * Section rail down the side of a record: a vertical list from `lg` up, a
 * scrolling row below. Same items, keys and ARIA as `Tabs`.
 *
 * ```tsx
 * <SideTabs items={[{ value: "profile", label: "Profile", icon: <User size={16} /> }]}
 *           value={section} onChange={setSection} />
 * ```
 */
export function SideTabs<T extends TabKey = string>({
  items,
  value,
  onChange,
  id,
  "aria-label": ariaLabel = "Sections",
  className,
  classNames,
}: SideTabsProps<T>) {
  const { onKeyDown, tabProps } = useTabList(items, value, onChange, id);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible",
        className,
        classNames?.root,
      )}
    >
      {items.map((tab: TabItem<T>, i) => {
        const { active, ...props } = tabProps(tab, i);
        return (
          <button
            key={tab.value}
            {...props}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors lg:w-full",
              "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "bg-primary-50 text-primary"
                : "text-text-secondary hover:bg-bg-main hover:text-text-primary",
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
            <span className={cn("flex-1 truncate", classNames?.label)}>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
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
