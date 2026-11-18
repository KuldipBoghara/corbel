import { act, render, renderHook, screen } from "@testing-library/react";
import { SortableItem, SortableList, useSortableOrder, type UseSortableOrderOptions } from "./SortableList.js";

type Row = { id: string };
const rows = (...ids: string[]): Row[] => ids.map((id) => ({ id }));
const getKey = (r: Row) => r.id;
const ids = (list: Row[]) => list.map(getKey);

function setup(initial: Partial<UseSortableOrderOptions<Row>> = {}) {
  return renderHook((props: UseSortableOrderOptions<Row>) => useSortableOrder(props), {
    initialProps: { items: rows("a", "b", "c"), getKey, ...initial },
  });
}

describe("useSortableOrder", () => {
  it("applies the move optimistically and reports it", async () => {
    const onReorder = vi.fn().mockResolvedValue(undefined);
    const { result } = setup({ onReorder });
    await act(() => result.current.handleReorder({ id: "a", fromIndex: 0, toIndex: 2 }));
    expect(ids(result.current.orderedItems)).toEqual(["b", "c", "a"]);
    expect(result.current.keys).toEqual(["b", "c", "a"]);
    expect(onReorder).toHaveBeenCalledWith({ id: "a", fromIndex: 0, toIndex: 2 });
  });

  it("rolls back when onReorder rejects", async () => {
    const { result } = setup({ onReorder: () => Promise.reject(new Error("nope")) });
    await act(() => result.current.handleReorder({ id: "c", fromIndex: 2, toIndex: 0 }));
    expect(ids(result.current.orderedItems)).toEqual(["a", "b", "c"]);
  });

  it("keeps rows that arrive after the drop at the end, and drops removed ones", async () => {
    const { result, rerender } = setup();
    await act(() => result.current.handleReorder({ id: "a", fromIndex: 0, toIndex: 2 }));
    rerender({ items: rows("a", "c", "d"), getKey });
    expect(ids(result.current.orderedItems)).toEqual(["c", "a", "d"]);
  });

  it("drops the override when resetKey changes", async () => {
    const { result, rerender } = setup({ resetKey: 1 });
    await act(() => result.current.handleReorder({ id: "a", fromIndex: 0, toIndex: 1 }));
    expect(ids(result.current.orderedItems)).toEqual(["b", "a", "c"]);
    rerender({ items: rows("a", "b", "c"), getKey, resetKey: 2 });
    expect(ids(result.current.orderedItems)).toEqual(["a", "b", "c"]);
  });
});

describe("SortableList", () => {
  it("gives each row a keyboard-focusable grip, and none when disabled", () => {
    const list = (disabled: boolean) => (
      <SortableList items={["a", "b"]} disabled={disabled}>
        <ul>
          {["a", "b"].map((id) => (
            <SortableItem key={id} id={id} disabled={disabled}>
              {(grip) => (
                <>
                  {grip}
                  {id}
                </>
              )}
            </SortableItem>
          ))}
        </ul>
      </SortableList>
    );
    const { rerender } = render(list(false));
    expect(screen.getAllByRole("button", { name: "Drag to reorder" })).toHaveLength(2);
    rerender(list(true));
    expect(screen.queryByRole("button", { name: "Drag to reorder" })).not.toBeInTheDocument();
  });
});
