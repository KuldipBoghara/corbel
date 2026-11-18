"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorPage } from "./ErrorPage.js";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  /** Clears the error and renders the children again. */
  reset: () => void;
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  /** What to render instead of the crashed tree. @default an `ErrorPage` with a retry button */
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  /** Report the error, e.g. to Sentry. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** The boundary resets when any of these change (e.g. `[location.pathname]`). */
  resetKeys?: readonly unknown[];
}

interface State {
  error: Error | null;
}

function isNetworkError(error: Error) {
  return (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    /network|internet|offline/i.test(error.message)
  );
}

/**
 * Catches render errors in its children and shows a fallback.
 *
 * ```tsx
 * <ErrorBoundary resetKeys={[pathname]} onError={(e) => Sentry.captureException(e)}>
 *   <Routes />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: State) {
    const prev = prevProps.resetKeys ?? [];
    const next = this.props.resetKeys ?? [];
    // prevState check: don't reset in the same update that caught the error.
    if (
      this.state.error &&
      prevState.error &&
      (prev.length !== next.length || prev.some((key, i) => !Object.is(key, next[i])))
    ) {
      this.reset();
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { fallback } = this.props;
    if (typeof fallback === "function") return fallback({ error, reset: this.reset });
    if (fallback !== undefined) return fallback;
    return <ErrorPage variant={isNetworkError(error) ? "offline" : "general"} onRetry={this.reset} />;
  }
}
