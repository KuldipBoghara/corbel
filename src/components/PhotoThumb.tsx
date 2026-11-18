"use client";

import { useState } from "react";
import { ImageOff, LoaderCircle } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PhotoThumbProps {
  /** Image URL. For private files, fetch the bytes yourself and pass an object URL. */
  src?: string | null;
  /** @default "Photo" */
  alt?: string;
  /** Shows a spinner, e.g. while you fetch the image. */
  loading?: boolean;
  /** Shows the "unavailable" placeholder. Also shown when `src` is missing or fails to load. */
  error?: boolean;
  /** Wraps the image in a link that opens it in a new tab. @default true */
  openable?: boolean;
  /** Styles the image (or its placeholder). Sets the size, e.g. `size-32 rounded-xl`. */
  className?: string;
}

/**
 * One photo thumbnail with loading and broken-image states.
 *
 * ```tsx
 * <PhotoThumb src={photo.url} alt="Display error" className="size-24" />
 *
 * // A private file served through an authenticated endpoint
 * const { data: objectUrl, isLoading, isError } = useGetFileBlobQuery(fileId);
 * <PhotoThumb src={objectUrl} loading={isLoading} error={isError} />
 * ```
 */
export function PhotoThumb({
  src,
  alt = "Photo",
  loading = false,
  error = false,
  openable = true,
  className,
}: PhotoThumbProps) {
  // Remembering which src failed (rather than a boolean) resets it when src changes.
  const [brokenSrc, setBrokenSrc] = useState<string>();
  const base = cn(
    "block size-20 overflow-hidden rounded-lg border border-border-default bg-bg-main object-cover",
    className,
  );

  if (loading) {
    return (
      <span className={cn(base, "flex items-center justify-center")} role="status" aria-label={`Loading ${alt}`}>
        <LoaderCircle size={16} className="animate-spin text-text-muted" aria-hidden />
      </span>
    );
  }

  if (error || !src || brokenSrc === src) {
    return (
      <span className={cn(base, "flex items-center justify-center")} role="img" aria-label={`${alt} unavailable`}>
        <ImageOff size={16} className="text-text-muted" aria-hidden />
      </span>
    );
  }

  const image = <img src={src} alt={alt} className={base} onError={() => setBrokenSrc(src)} />;

  return openable ? (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${alt}`}
      className="block rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      {image}
    </a>
  ) : (
    image
  );
}
