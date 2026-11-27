"use client";

import { cn } from "../utils/cn.js";
import { Modal, type ModalProps } from "./Modal.js";

export type DrawerPlacement = "right" | "left";
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps extends Omit<ModalProps, "size"> {
  /** Side it slides in from. @default "right" */
  placement?: DrawerPlacement;
  /** Panel width: 384, 448 or 672 px (full width on small screens). @default "md" */
  size?: DrawerSize;
}

const SIZES: Record<DrawerSize, string> = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

const PLACEMENTS: Record<DrawerPlacement, string> = {
  right: "right-0 animate-corbel-slide-in-right",
  left: "left-0 animate-corbel-slide-in-left",
};

/**
 * Full-height panel that slides in from the side, for filters, details or a mobile nav.
 * It is a Modal underneath: same props, focus handling, Escape/backdrop closing and scroll lock.
 *
 * ```tsx
 * <Drawer open={open} onClose={() => setOpen(false)} title="Filters"
 *   footer={<Button onClick={apply}>Apply</Button>}>
 *   …
 * </Drawer>
 * ```
 */
export function Drawer({ placement = "right", size = "md", className, classNames, ...props }: DrawerProps) {
  return (
    <Modal
      {...props}
      size="full"
      classNames={{ ...classNames, body: cn("min-h-0", classNames?.body) }}
      className={cn(
        "fixed inset-y-0 my-0 h-dvh min-h-0 rounded-none motion-reduce:animate-none",
        SIZES[size],
        PLACEMENTS[placement],
        className,
      )}
    />
  );
}
