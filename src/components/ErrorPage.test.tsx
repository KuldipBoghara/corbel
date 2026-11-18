import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ErrorPage, getErrorVariant } from "./ErrorPage.js";

describe("getErrorVariant", () => {
  it.each([
    [{ status: 403 }, "forbidden"],
    [{ status: 404 }, "content-not-found"],
    [{ status: 500 }, "server-error"],
    [{ status: 503 }, "service-unavailable"],
    [{ status: "FETCH_ERROR", error: "TypeError: Failed to fetch" }, "offline"],
    [{ status: "TIMEOUT_ERROR" }, "timeout"],
    [{ status: 418 }, "general"],
    [{ name: "AbortError" }, "timeout"],
    [new TypeError("boom"), "general"],
    [null, "general"],
    ["oops", "general"],
    [{}, "general"],
  ])("%j -> %s", (error, variant) => {
    expect(getErrorVariant(error)).toBe(variant);
  });
});

describe("ErrorPage", () => {
  it("renders variant defaults with overridable text and actions", async () => {
    const onRetry = vi.fn();
    render(<ErrorPage variant="forbidden" title="No entry" onRetry={onRetry} homeHref="/" />);
    expect(screen.getByRole("heading", { name: "No entry" })).toBeInTheDocument();
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go back home" })).toHaveAttribute("href", "/");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("offline variant retries when the connection returns", () => {
    const onRetry = vi.fn();
    render(<ErrorPage variant="offline" onRetry={onRetry} />);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
