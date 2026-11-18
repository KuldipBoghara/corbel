"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  Clock,
  FileXCorner,
  MapPinOff,
  OctagonExclamationPoint,
  ServerCrash,
  ShieldExclamationPoint,
  TriangleExclamationPoint,
  WifiOff,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { Button } from "./Button.js";

export type ErrorPageVariant =
  | "forbidden"
  | "not-found"
  | "content-not-found"
  | "server-error"
  | "service-unavailable"
  | "offline"
  | "timeout"
  | "general";

export type ErrorPageSlot = "root" | "icon" | "code" | "title" | "message" | "actions";

export interface ErrorPageProps {
  /** Picks the default code, title, message and icon. @default "general" */
  variant?: ErrorPageVariant;
  /** Small text above the title, e.g. "404". Defaults per variant; pass `null` to hide. */
  code?: ReactNode;
  title?: ReactNode;
  message?: ReactNode;
  /** Replaces the variant icon, e.g. with your own illustration. Pass `null` to hide. */
  icon?: ReactNode;
  /** Replaces the default retry / home buttons. */
  actions?: ReactNode;
  /** Shows a retry button. With `variant="offline"` it is also called when the connection comes back. */
  onRetry?: () => void;
  /** @default "Try again" */
  retryLabel?: ReactNode;
  /** Shows a home link pointing here. */
  homeHref?: string;
  /** Shows a home button that calls this (e.g. `() => navigate("/")`). */
  onHome?: () => void;
  /** @default "Go back home" */
  homeLabel?: ReactNode;
  className?: string;
  classNames?: Partial<Record<ErrorPageSlot, string>>;
}

const VARIANTS: Record<
  ErrorPageVariant,
  { code?: string; title: string; message: string; icon: ReactNode }
> = {
  forbidden: {
    code: "403",
    title: "Forbidden",
    message: "Sorry, you don't have permission to access this page.",
    icon: <ShieldExclamationPoint className="size-full" />,
  },
  "not-found": {
    code: "404",
    title: "Page not found",
    message: "Oops! The page you're looking for doesn't exist.",
    icon: <MapPinOff className="size-full" />,
  },
  "content-not-found": {
    code: "404",
    title: "Content not found",
    message: "Sorry, we couldn't find the content you're looking for.",
    icon: <FileXCorner className="size-full" />,
  },
  "server-error": {
    code: "500",
    title: "Server error",
    message: "Something went wrong on our end. We're working on it, please try again later.",
    icon: <ServerCrash className="size-full" />,
  },
  "service-unavailable": {
    code: "503",
    title: "Service unavailable",
    message: "Our service is currently unavailable. Please try again later.",
    icon: <TriangleExclamationPoint className="size-full" />,
  },
  offline: {
    title: "Connection error",
    message: "Unable to fetch data. Please check your internet connection.",
    icon: <WifiOff className="size-full" />,
  },
  timeout: {
    title: "Request timed out",
    message: "The request took too long. Please try again.",
    icon: <Clock className="size-full" />,
  },
  general: {
    title: "Something went wrong",
    message: "We're sorry, but an unexpected error occurred.",
    icon: <OctagonExclamationPoint className="size-full" />,
  },
};

const linkButtonClass = (primary: boolean) =>
  cn(
    "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold whitespace-nowrap transition-colors",
    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none",
    primary
      ? "bg-primary text-primary-contrast shadow-sm hover:bg-primary-dark"
      : "border border-border-default bg-bg-card text-text-primary hover:bg-bg-main",
  );

/**
 * Full-page error screen (403, 404, 500, 503, offline, timeout, general).
 *
 * ```tsx
 * <ErrorPage variant="not-found" homeHref="/" />
 * <ErrorPage variant={getErrorVariant(error)} onRetry={refetch} />
 * ```
 */
export function ErrorPage({
  variant = "general",
  code,
  title,
  message,
  icon,
  actions,
  onRetry,
  retryLabel = "Try again",
  homeHref,
  onHome,
  homeLabel = "Go back home",
  className,
  classNames,
}: ErrorPageProps) {
  const preset = VARIANTS[variant];
  const shownCode = code === undefined ? preset.code : code;
  const shownIcon = icon === undefined ? preset.icon : icon;

  useEffect(() => {
    if (variant !== "offline" || !onRetry) return;
    const retry = () => onRetry();
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [variant, onRetry]);

  const homePrimary = !onRetry;
  const defaultActions = (onRetry || homeHref || onHome) && (
    <>
      {onRetry && <Button onClick={onRetry}>{retryLabel}</Button>}
      {homeHref ? (
        <a href={homeHref} className={linkButtonClass(homePrimary)}>
          {homeLabel}
        </a>
      ) : (
        onHome && (
          <Button variant={homePrimary ? "primary" : "outline"} onClick={onHome}>
            {homeLabel}
          </Button>
        )
      )}
    </>
  );
  const shownActions = actions === undefined ? defaultActions : actions;

  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12 text-center",
        className,
        classNames?.root,
      )}
    >
      {shownIcon && (
        <div className={cn("mb-6 size-20 text-primary", classNames?.icon)} aria-hidden>
          {shownIcon}
        </div>
      )}
      {shownCode && (
        <p
          className={cn(
            "mb-2 text-sm font-semibold tracking-widest text-text-muted uppercase",
            classNames?.code,
          )}
        >
          {shownCode}
        </p>
      )}
      <h1
        className={cn(
          "text-2xl font-bold tracking-tight text-text-primary sm:text-3xl",
          classNames?.title,
        )}
      >
        {title ?? preset.title}
      </h1>
      <p className={cn("mt-2 max-w-md text-base text-text-secondary", classNames?.message)}>
        {message ?? preset.message}
      </p>
      {shownActions && (
        <div
          className={cn(
            "mt-6 flex flex-col items-center gap-3 sm:flex-row",
            classNames?.actions,
          )}
        >
          {shownActions}
        </div>
      )}
    </div>
  );
}

/**
 * Maps a failed request to an `ErrorPage` variant. Understands RTK Query /
 * fetchBaseQuery errors (`{ status: 403 | 404 | 500 | 503 | "FETCH_ERROR" | "TIMEOUT_ERROR" }`)
 * and aborted fetches (`{ name: "AbortError" }`). Anything else is `"general"`.
 */
export function getErrorVariant(error: unknown): ErrorPageVariant {
  if (!error || typeof error !== "object") return "general";
  if ("name" in error) return error.name === "AbortError" ? "timeout" : "general";
  if (!("status" in error)) return "general";
  switch (error.status) {
    case "FETCH_ERROR":
      return "offline";
    case "TIMEOUT_ERROR":
      return "timeout";
    case 403:
      return "forbidden";
    case 404:
      return "content-not-found";
    case 500:
      return "server-error";
    case 503:
      return "service-unavailable";
    default:
      return "general";
  }
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** `true` while the browser reports a network connection. Re-renders on change. Always `true` on the server. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}
