import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { InfiniteList, type InfiniteListProps } from "./InfiniteList.js";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
type Observer = { callback: Callback; disconnected: boolean };
let observers: Observer[] = [];

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      entry: Observer;
      constructor(callback: Callback) {
        this.entry = { callback, disconnected: false };
        observers.push(this.entry);
      }
      observe() {}
      disconnect() {
        this.entry.disconnected = true;
      }
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const live = () => observers.filter((o) => !o.disconnected);
const intersect = () => act(() => live().forEach((o) => o.callback([{ isIntersecting: true }])));

function List(props: Partial<InfiniteListProps<string>>) {
  return <InfiniteList items={["a", "b"]} getItemKey={(i) => i} renderItem={(i) => <p>{i}</p>} {...props} />;
}

describe("InfiniteList", () => {
  it("calls onLoadMore when the sentinel intersects", () => {
    const onLoadMore = vi.fn();
    render(<List hasMore onLoadMore={onLoadMore} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    intersect();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not observe without more pages, while loading more, or after an error", () => {
    const { rerender } = render(<List onLoadMore={vi.fn()} />);
    expect(live()).toHaveLength(0);
    rerender(<List hasMore loadingMore onLoadMore={vi.fn()} />);
    expect(live()).toHaveLength(0);
    rerender(<List hasMore error onLoadMore={vi.fn()} />);
    expect(live()).toHaveLength(0);
  });

  it("re-observes after a page loads, so a short page pulls the next one", () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<List hasMore loadingMore onLoadMore={onLoadMore} />);
    rerender(<List hasMore onLoadMore={onLoadMore} />);
    intersect();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("shows the initial spinner, empty and error states", () => {
    const { rerender } = render(<List items={[]} loading />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    rerender(<List items={[]} empty={<p>Nothing</p>} />);
    expect(screen.getByText("Nothing")).toBeInTheDocument();
    rerender(<List items={[]} error="Boom" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
  });

  it("offers a retry when a later page fails", async () => {
    const onRetry = vi.fn();
    render(<List hasMore error="Offline" onRetry={onRetry} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});
