"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn.js";
import { popoverClass, useAnchoredPopover } from "./DatePicker.js";

export type MenuSlot = "menu" | "item" | "icon" | "separator";

export interface MenuAction {
  label: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
  /** `danger` colours the item red, e.g. for Delete. @default "default" */
  tone?: "default" | "danger";
  disabled?: boolean;
}

export type MenuItem = MenuAction | { type: "separator" };

export interface MenuProps {
  /** The button that opens the menu, e.g. a "⋯" icon button. It gets the ARIA wiring. */
  trigger: ReactElement;
  /** Actions, top to bottom. `false`/`null` entries are skipped, so items can be conditional. */
  items: readonly (MenuItem | false | null | undefined)[];
  /** Accessible name of the menu. @default the trigger labels it */
  "aria-label"?: string;
  /** Portal target. @default document.body */
  container?: HTMLElement | null;
  /** Styles the menu panel. */
  className?: string;
  classNames?: Partial<Record<MenuSlot, string>>;
}

const isAction = (item: MenuItem): item is MenuAction => !("type" in item);

/**
 * A list of actions that opens from a trigger button.
 * Arrow keys, Home and End move between items, Enter selects,
 * Escape closes and returns focus to the trigger.
 *
 * ```tsx
 * <Menu
 *   trigger={<button aria-label="Row actions"><Ellipsis size={16} /></button>}
 *   items={[
 *     { label: "Edit", icon: <Pencil size={14} />, onSelect: () => edit(row) },
 *     { type: "separator" },
 *     { label: "Delete", tone: "danger", onSelect: () => remove(row) },
 *   ]}
 * />
 * ```
 */
export function Menu({
  trigger,
  items,
  "aria-label": ariaLabel,
  container,
  className,
  classNames,
}: MenuProps) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;
  const [open, setOpen] = useState(false);
  const { anchorRef, popoverRef, style } = useAnchoredPopover(open, setOpen);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Which item to focus when the menu opens: first, or last after ArrowUp on the trigger.
  const focusOnOpen = useRef<"first" | "last">("first");

  const list = items.filter((item): item is MenuItem => Boolean(item));
  const enabled = list.flatMap((item, i) => (isAction(item) && !item.disabled ? [i] : []));

  useEffect(() => {
    if (!open) return;
    const target = focusOnOpen.current === "last" ? enabled[enabled.length - 1] : enabled[0];
    if (target !== undefined) itemRefs.current[target]?.focus();
    // Only when it opens, not on every items change.
  }, [open]);

  const close = () => {
    setOpen(false);
    document.getElementById(triggerId)?.focus();
  };

  const openWith = (where: "first" | "last") => {
    focusOnOpen.current = where;
    setOpen(true);
  };

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openWith(e.key === "ArrowUp" ? "last" : "first");
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const pos = enabled.indexOf(current);
    let target: number | undefined;
    if (e.key === "ArrowDown") target = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowUp") target = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") target = enabled[0];
    else if (e.key === "End") target = enabled[enabled.length - 1];
    else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // don't also close a surrounding Modal
      close();
      return;
    } else if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (target === undefined) return;
    e.preventDefault();
    itemRefs.current[target]?.focus();
  };

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        id: triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? menuId : undefined,
      })
    : trigger;

  return (
    <>
      <div
        ref={anchorRef}
        className="inline-flex"
        onClick={() => (open ? setOpen(false) : openWith("first"))}
        onKeyDown={onTriggerKeyDown}
      >
        {triggerEl}
      </div>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            id={menuId}
            role="menu"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : triggerId}
            style={style}
            onKeyDown={onMenuKeyDown}
            className={cn(popoverClass, "min-w-44 p-1", classNames?.menu, className)}
          >
            {list.map((item, i) =>
              isAction(item) ? (
                <button
                  key={i}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    item.tone === "danger"
                      ? "text-error hover:bg-error/10 focus-visible:bg-error/10"
                      : "text-text-primary hover:bg-bg-main focus-visible:bg-bg-main",
                    classNames?.item,
                  )}
                >
                  {item.icon && (
                    <span className={cn("flex shrink-0 opacity-80", classNames?.icon)} aria-hidden>
                      {item.icon}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </button>
              ) : (
                <div
                  key={i}
                  role="separator"
                  className={cn("my-1 h-px bg-border-default", classNames?.separator)}
                />
              ),
            )}
          </div>,
          container ?? document.body,
        )}
    </>
  );
}
