import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ErrorBoundary } from "./ErrorBoundary.js";

let shouldThrow = true;
function Bomb() {
  if (shouldThrow) throw new Error("kaboom");
  return <p>All good</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("catches, reports and resets from the default fallback", async () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "kaboom" }),
      expect.anything(),
    );

    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("supports a render-function fallback and resets when resetKeys change", () => {
    const fallback = ({ error }: { error: Error }) => <p>Failed: {error.message}</p>;
    const { rerender } = render(
      <ErrorBoundary resetKeys={["/a"]} fallback={fallback}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Failed: kaboom")).toBeInTheDocument();

    shouldThrow = false;
    rerender(
      <ErrorBoundary resetKeys={["/b"]} fallback={fallback}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });
});
