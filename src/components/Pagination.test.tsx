import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { getPageRange, Pagination } from "./Pagination.js";

describe("getPageRange", () => {
  it("lists every page when there are few", () => {
    expect(getPageRange(1, 1)).toEqual([1]);
    expect(getPageRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageRange(1, 0)).toEqual([]);
  });

  it("adds ellipses on both sides of the window", () => {
    expect(getPageRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("shows a single skipped page instead of an ellipsis", () => {
    expect(getPageRange(3, 10)).toEqual([1, 2, 3, 4, "ellipsis", 10]);
    expect(getPageRange(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(getPageRange(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });

  it("honours siblings", () => {
    expect(getPageRange(10, 20, 2)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });
});

describe("Pagination", () => {
  it("shows the range summary", () => {
    render(<Pagination page={2} pageSize={10} total={42} onPageChange={() => {}} />);
    expect(screen.getByRole("navigation")).toHaveTextContent("Showing 11–20 of 42");
  });

  it("shows 0–0 for an empty list and hides page buttons", () => {
    render(<Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />);
    expect(screen.getByRole("navigation")).toHaveTextContent("Showing 0–0 of 0");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onPageChange from page, previous and next buttons", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={42} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Page 5" }));
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange.mock.calls).toEqual([[5], [2]]);
  });

  it("disables next on the last page", () => {
    render(<Pagination page={5} pageSize={10} total={42} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("changes the page size", async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination page={1} pageSize={10} total={42} onPageChange={() => {}} onPageSizeChange={onPageSizeChange} />,
    );
    await userEvent.selectOptions(screen.getByLabelText("Rows per page"), "25");
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });
});
