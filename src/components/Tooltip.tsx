"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn.js";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** Text in the bubble. Nothing is shown while it is empty. */
  content: ReactNode;
  /** The element the tooltip describes. It gets `aria-describedby` while the tooltip shows. */
  children: ReactNode;
  /** Preferred side. Top and bottom flip when there is no room. @default "top" */
  placement?: TooltipPlacement;
  /** Milliseconds of hover before it opens. Focus opens it at once. @default 300 */
  delay?: number;
  disabled?: boolean;
  /** Portal target. @default document.body */
  container?: HTMLElement | null;
  /** Styles the bubble. */
  className?: string;
}

const GAP = 6;
const EDGE = 8;

/**
 * Short hint shown on hover and keyboard focus, rendered in a portal so it is
 * never clipped. Escape hides it. Don't put interactive content in it: use a popover or Menu for that.
 *
 * ```tsx
 * <Tooltip content="Delete row">
 *   <button aria-label="Delete row"><Trash2 size={16} /></button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  disabled = false,
  container,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = (wait: number) => {
    clearTimeout(timer.current);
    if (wait <= 0) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), wait);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const visible = open && !disabled && content !== null && content !== undefined && content !== "";

  useLayoutEffect(() => {
    if (!visible) return setCoords(null);
    const a = anchorRef.current?.getBoundingClientRect();
    const b = bubbleRef.current;
    if (!a || !b) return;
    const w = b.offsetWidth;
    const h = b.offsetHeight;
    let side = placement;
    if (side === "top" && a.top - h - GAP < EDGE) side = "bottom";
    else if (side === "bottom" && a.bottom + h + GAP > window.innerHeight - EDGE) side = "top";
    const centerX = a.left + a.width / 2 - w / 2;
    const centerY = a.top + a.height / 2 - h / 2;
    const pos = {
      top: { top: a.top - h - GAP, left: centerX },
      bottom: { top: a.bottom + GAP, left: centerX },
      left: { top: centerY, left: a.left - w - GAP },
      right: { top: centerY, left: a.right + GAP },
    }[side];
    setCoords({
      top: Math.max(EDGE, Math.min(pos.top, window.innerHeight - h - EDGE)),
      left: Math.max(EDGE, Math.min(pos.left, window.innerWidth - w - EDGE)),
    });
  }, [visible, placement, content]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    // Hide rather than chase the anchor: tooltips are short-lived.
    window.addEventListener("scroll", hide, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", hide, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  const trigger =
    visible && isValidElement<{ "aria-describedby"?: string }>(children)
      ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
          "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" "),
        })
      : children;

  return (
    <>
      {/* The wrapper takes the events, so any child works, even a disabled button. */}
      <span
        ref={anchorRef}
        className="inline-flex"
        onMouseEnter={() => show(delay)}
        onMouseLeave={hide}
        onFocus={() => show(0)}
        onBlur={hide}
      >
        {trigger}
      </span>
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            style={{ top: coords?.top ?? 0, left: coords?.left ?? 0, visibility: coords ? "visible" : "hidden" }}
            className={cn(
              "animate-corbel-fade-in pointer-events-none fixed z-[70] max-w-xs rounded-lg bg-text-primary px-2.5 py-1.5 text-xs font-medium text-bg-card shadow-lg",
              className,
            )}
          >
            {content}
          </div>,
          container ?? document.body,
        )}
    </>
  );
}
