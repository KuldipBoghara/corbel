"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export type AccordionSlot = "root" | "item" | "trigger" | "icon" | "content";

export interface AccordionProps {
  items: readonly AccordionItem[];
  /** Lets several items be open at once. Otherwise opening one closes the others. */
  multiple?: boolean;
  /** Open item ids (controlled). */
  value?: string[];
  /** Initially open item ids (uncontrolled). */
  defaultValue?: string[];
  /** Receives the new list of open ids. */
  onChange?: (value: string[]) => void;
  className?: string;
  classNames?: Partial<Record<AccordionSlot, string>>;
}

/**
 * Stack of collapsible sections, e.g. an FAQ.
 *
 * ```tsx
 * <Accordion items={faqs.map((f) => ({ id: f.id, title: f.question, content: f.answer }))} />
 * ```
 */
export function Accordion({
  items,
  multiple = false,
  value,
  defaultValue,
  onChange,
  className,
  classNames,
}: AccordionProps) {
  const baseId = useId();
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const open = value ?? inner;

  const toggle = (id: string) => {
    const next = open.includes(id)
      ? open.filter((x) => x !== id)
      : multiple
        ? [...open, id]
        : [id];
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <div className={cn("space-y-3", className, classNames?.root)}>
      {items.map((item) => {
        const expanded = open.includes(item.id);
        const triggerId = `${baseId}-${item.id}-trigger`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-lg border border-border-default bg-bg-card",
              classNames?.item,
            )}
          >
            <button
              type="button"
              id={triggerId}
              aria-expanded={expanded}
              aria-controls={panelId}
              disabled={item.disabled}
              onClick={() => toggle(item.id)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left font-medium text-text-primary transition-colors hover:bg-bg-main",
                "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none focus-visible:ring-inset",
                "disabled:cursor-not-allowed disabled:opacity-50",
                classNames?.trigger,
              )}
            >
              {item.title}
              <ChevronDown
                aria-hidden
                className={cn(
                  "size-5 shrink-0 text-text-muted transition-transform",
                  expanded && "rotate-180",
                  classNames?.icon,
                )}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!expanded}
              className={cn(
                "border-t border-border-light px-4 py-3 leading-relaxed text-text-secondary",
                classNames?.content,
              )}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
