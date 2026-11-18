import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names and resolves Tailwind conflicts, so the last class wins:
 * `cn("bg-primary px-4", "bg-error")` → `"px-4 bg-error"`.
 *
 * Every component passes your `className` through this last, which is what
 * lets you override any default style from the outside.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
