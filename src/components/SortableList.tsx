"use client";

import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../utils/cn.js";

export type SortableId = UniqueIdentifier;

export interface ReorderMove {
  id: SortableId;
  /** Zero-based position before the drop. */
  fromIndex: number;
  /** Zero-based position after the drop. */
  toIndex: number;
}

export interface SortableListProps {
  /** Row ids in the order the rows are rendered. */
  items: SortableId[];
  /** Called on drop. Not called when a row is dropped where it started. */
  onReorder?: (move: ReorderMove) => void;
  /** Turns dragging off, e.g. while a filter makes positions meaningless. */
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Drag-to-reorder for a vertical list, over dnd-kit. Presentation-free: you
 * render the rows with `SortableItem`. Rows move by their grip only, with the
 * pointer or the keyboard (focus the grip, Space to lift, arrows to move,
 * Space to drop, Escape to cancel).
 *
 * ```tsx
 * <SortableList items={keys} onReorder={handleReorder}>
 *   <ul>{rows.map((r) => <SortableItem key={r.id} id={r.id}>{(grip) => <>{grip}{r.name}</>}</SortableItem>)}</ul>
 * </SortableList>
 * ```
 */
export function SortableList({ items, onReorder, disabled = false, children }: SortableListProps) {
  const sensors = useSensors(
    // A few pixels of travel first, so a click on the grip stays a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (disabled) return <>{children}</>;

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const fromIndex = items.indexOf(active.id);
    const toIndex = items.indexOf(over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    onReorder?.({ id: active.id, fromIndex, toIndex });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export interface SortableItemProps {
  /** Must match this row's entry in `SortableList`'s `items`. */
  id: SortableId;
  /** @default "li" */
  as?: "li" | "div" | "tr";
  /** Renders a plain row and passes `null` as the grip. */
  disabled?: boolean;
  className?: string;
  /** Extra classes for the grip button. */
  handleClassName?: string;
  /** @default "Drag to reorder" */
  handleLabel?: string;
  /** Receives the grip button (or `null` when disabled) to place in your layout. */
  children: (grip: ReactNode) => ReactNode;
}

/** One draggable row. Outside a `SortableList`, or `disabled`, it renders untouched. */
export function SortableItem({
  id,
  as = "li",
  disabled = false,
  className,
  handleClassName,
  handleLabel = "Drag to reorder",
  children,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
  const Element = as as ElementType;

  const grip = disabled ? null : (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={handleLabel}
      title={handleLabel}
      // Rows often toggle on click; the grip must not.
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "shrink-0 cursor-grab touch-none rounded-md p-1 text-text-muted transition-colors hover:bg-bg-main hover:text-text-secondary active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
        handleClassName,
      )}
    >
      <GripVertical size={18} aria-hidden />
    </button>
  );

  return (
    <Element
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "relative z-30 opacity-90 shadow-lg", className)}
    >
      {children(grip)}
    </Element>
  );
}

export interface UseSortableOrderOptions<T> {
  /** Rows in the order the server gave them. */
  items: T[];
  getKey: (item: T) => SortableId;
  /** Persists the move. Reject (throw) on failure to roll the list back. */
  onReorder?: (move: ReorderMove) => void | Promise<unknown>;
  /** Change it when `items` is a fresh read, to drop the optimistic order. */
  resetKey?: unknown;
}

export interface UseSortableOrderResult<T> {
  /** Rows to render, in the optimistic order. */
  orderedItems: T[];
  /** Ids for `SortableList`'s `items`. */
  keys: SortableId[];
  /** Pass as `SortableList`'s `onReorder`. */
  handleReorder: (move: ReorderMove) => Promise<void>;
}

/**
 * Holds the dropped order while the server confirms it, so a row does not
 * spring back for the round trip. Rolls back if `onReorder` rejects. Rows that
 * arrive after the drop are kept, after the ones the override knows about.
 */
export function useSortableOrder<T>({
  items,
  getKey,
  onReorder,
  resetKey,
}: UseSortableOrderOptions<T>): UseSortableOrderResult<T> {
  const [override, setOverride] = useState<SortableId[] | null>(null);

  useEffect(() => {
    setOverride(null);
  }, [resetKey]);

  const orderedItems = useMemo(() => {
    if (!override) return items;
    const byKey = new Map(items.map((item) => [getKey(item), item]));
    const known = new Set(override);
    const moved = override.flatMap((key) => (byKey.has(key) ? [byKey.get(key) as T] : []));
    return [...moved, ...items.filter((item) => !known.has(getKey(item)))];
  }, [items, override, getKey]);

  const keys = orderedItems.map(getKey);

  const handleReorder = async (move: ReorderMove) => {
    setOverride(arrayMove(keys, move.fromIndex, move.toIndex));
    try {
      await onReorder?.(move);
    } catch {
      setOverride(null);
    }
  };

  return { orderedItems, keys, handleReorder };
}
