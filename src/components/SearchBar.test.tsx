import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SearchBar } from "./SearchBar.js";

describe("SearchBar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onChange on every keystroke without debounce, and clears", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchBar value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Search" }), "a");
    expect(onChange).toHaveBeenLastCalledWith("a");
    rerender(<SearchBar value="abc" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("debounces onChange but updates the field at once; clear cancels the pending call", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} debounceMs={300} />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "ab" } });
    expect(input).toHaveValue("ab");
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("ab");

    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith("");
  });
});
