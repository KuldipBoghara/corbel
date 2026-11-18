import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { SearchSelectList } from "./SearchSelectList.js";
import { MultiSelectList } from "./MultiSelectList.js";

interface User {
  id: string;
  name: string;
}
const users: User[] = [
  { id: "1", name: "Ann" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Cat" },
];
const base = { getKey: (u: User) => u.id, getLabel: (u: User) => u.name };

describe("SearchSelectList", () => {
  it("toggles checkboxes and reports keys plus items", async () => {
    const onChange = vi.fn();
    render(<SearchSelectList label="Users" items={users} value={["1"]} onChange={onChange} {...base} />);
    expect(screen.getByText("(1 selected)")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "Bob" }));
    expect(onChange).toHaveBeenCalledWith(["1", "2"], [users[0], users[1]]);
    await userEvent.click(screen.getByRole("checkbox", { name: "Ann" }));
    expect(onChange).toHaveBeenLastCalledWith([], []);
  });

  it("single mode uses radios with a None option", async () => {
    const onChange = vi.fn();
    render(<SearchSelectList multiple={false} label="Owner" items={users} value="2" onChange={onChange} {...base} />);
    expect(screen.getByRole("radio", { name: "Bob" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Cat" }));
    expect(onChange).toHaveBeenCalledWith("3", users[2]);
    await userEvent.click(screen.getByRole("radio", { name: "None" }));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
  });

  it("filters locally and keeps selected items pinned", async () => {
    render(
      <SearchSelectList label="Users" items={users} value={["3"]} onChange={() => {}} searchDelay={0} {...base} />,
    );
    await userEvent.type(screen.getByRole("searchbox"), "bo");
    expect(screen.getByRole("checkbox", { name: "Bob" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Ann" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Cat" })).toBeChecked(); // pinned selection
  });

  it("reports search debounced instead of filtering when onSearchChange is set", async () => {
    const onSearchChange = vi.fn();
    render(
      <SearchSelectList label="Users" items={users} value={[]} onChange={() => {}} onSearchChange={onSearchChange} {...base} />,
    );
    await userEvent.type(screen.getByRole("searchbox"), "zz");
    expect(screen.getByRole("checkbox", { name: "Ann" })).toBeInTheDocument();
    await vi.waitFor(() => expect(onSearchChange).toHaveBeenCalledWith("zz"));
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it("hides excluded and disables disabled items", () => {
    render(
      <SearchSelectList
        label="Users"
        items={users}
        value={[]}
        onChange={() => {}}
        excludeKeys={["1"]}
        isItemDisabled={(u) => u.id === "2"}
        {...base}
      />,
    );
    expect(screen.queryByRole("checkbox", { name: "Ann" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Bob" })).toBeDisabled();
  });

  it("shows loading, empty and error states", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<SearchSelectList label="U" items={[]} value={[]} onChange={() => {}} loading {...base} />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    rerender(<SearchSelectList label="U" items={[]} value={[]} onChange={() => {}} emptyMessage="Nobody" {...base} />);
    expect(screen.getByText("Nobody")).toBeInTheDocument();
    rerender(
      <SearchSelectList label="U" items={[]} value={[]} onChange={() => {}} loadError="Boom" onRetry={onRetry} {...base} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("accumulates pages and loads more when the sentinel scrolls into view", () => {
    let trigger: (() => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          trigger = () => cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
        }
        observe() {}
        disconnect() {}
      },
    );

    function Paged() {
      const [page, setPage] = useState(1);
      const items = page === 1 ? users.slice(0, 2) : users.slice(2);
      return (
        <SearchSelectList
          label="Users"
          items={items}
          page={page}
          hasMore={page < 2}
          onLoadMore={() => setPage((p) => p + 1)}
          value={[]}
          onChange={() => {}}
          {...base}
        />
      );
    }
    render(<Paged />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    act(() => trigger!());
    expect(screen.getAllByRole("checkbox").map((c) => c.closest("label")!.textContent)).toEqual(["Ann", "Bob", "Cat"]);
    vi.unstubAllGlobals();
  });
});

describe("MultiSelectList", () => {
  const options = [
    { value: "x", label: "X-ray", description: "Floor 1" },
    { value: "y", label: "Yard", disabled: true },
  ];

  it("toggles, clears, and respects disabled options", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<MultiSelectList label="Wards" options={options} value={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /X-ray/ }));
    expect(onChange).toHaveBeenCalledWith(["x"]);
    expect(screen.getByRole("checkbox", { name: "Yard" })).toBeDisabled();

    rerender(<MultiSelectList label="Wards" options={options} value={["x"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear (1)" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
