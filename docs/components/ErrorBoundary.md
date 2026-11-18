# ErrorBoundary

Catches render errors in its children and shows a fallback instead of a blank screen.

```tsx
import { ErrorBoundary } from "corbel";
```

## Usage

```tsx
// Default fallback: an ErrorPage with a "Try again" button that re-renders the children
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Reset on navigation, and report errors
<ErrorBoundary resetKeys={[location.pathname]} onError={(error, info) => Sentry.captureException(error)}>
  <Outlet />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={({ error, reset }) => <ErrorState message={error.message} onRetry={reset} />}>
  <Chart />
</ErrorBoundary>

<ErrorBoundary fallback={<p>Couldn't load this widget.</p>}>
  <Widget />
</ErrorBoundary>
```

The default fallback shows the `"offline"` variant when the browser is offline or the error message mentions the network, and `"general"` otherwise.
Like every React error boundary, it doesn't catch errors in event handlers or async code.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | | |
| `fallback` | `ReactNode \| ({ error, reset }) => ReactNode` | `ErrorPage` | What to show after an error. `reset()` re-renders the children. |
| `onError` | `(error: Error, info: ErrorInfo) => void` | | Called once per caught error. |
| `resetKeys` | `unknown[]` | | The boundary resets when any value changes. |
