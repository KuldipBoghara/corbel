"use client";

import { useState } from "react";
import { cn } from "../utils/cn.js";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  /** Reduced to initials when there is no image or it fails to load. */
  name: string;
  /** Photo or logo URL. */
  src?: string | null;
  /** @default "md" */
  size?: AvatarSize;
  /** Background of the initials, e.g. a tenant's brand colour. Text turns white. */
  color?: string | null;
  /** Rounded square instead of a circle, e.g. for organisation logos. */
  square?: boolean;
  /**
   * Accessible name. Omit when the name is already shown next to the avatar
   * (the default), so screen readers don't read it twice.
   */
  alt?: string;
  className?: string;
}

const SIZES: Record<AvatarSize, string> = {
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
};

/** "Ada Lovelace King" → "AL". */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/**
 * Image, or an initials bubble when there is no image or it fails to load.
 *
 * ```tsx
 * <Avatar name={user.name} src={user.photoUrl} size="sm" />
 * ```
 */
export function Avatar({
  name,
  src,
  size = "md",
  color,
  square = false,
  alt,
  className,
}: AvatarProps) {
  // Remember which URL failed, so a new `src` gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shape = square ? "rounded-xl" : "rounded-full";

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        onError={() => setFailedSrc(src)}
        className={cn(
          "shrink-0 object-cover ring-1 ring-border-default",
          SIZES[size],
          shape,
          className,
        )}
      />
    );
  }

  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "flex shrink-0 items-center justify-center font-bold select-none",
        SIZES[size],
        shape,
        color ? "text-white" : "bg-primary-100 text-primary",
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {initials(name)}
    </span>
  );
}
