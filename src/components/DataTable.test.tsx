import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { DataTable, type Column, type DataTableProps } from "./DataTable.js";

type User = { id: number; name: string; email: string };
const users: User[] = [
  { id: 1, name: "Ada", email: "ada@x.io" },
  { id: 2, name: "Linus", email: "linus@x.io" },
];
const columns: Column<User>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", cell: (u) => <a href={`mailto:${u.email}`}>{u.email}</a>, sortable: true, sortKey: "mail" },
];

function Table(props: Partial<DataTableProps<User>>) {
  return <DataTable columns={columns} rows={users} getRowKey={(u) => u.id} {...props} />;
}

describe("DataTable", () => {
  it("renders headers and cells, with the default cell reading row[key]", () => {
    render(<Table />);
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(rows[1]!).getByText("Ada")).toBeInTheDocument();
    expect(within(rows[1]!).getByRole("link", { name: "ada@x.io" })).toBeInTheDocument();
  });

  it("starts a new column ascending, flips the active one, and uses sortKey", async () => {
    const onSortChange = vi.fn();
    const { rerender } = render(<Table onSortChange={onSortChange} />);
    await userEvent.click(screen.getByRole("button", { name: /name/i }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "asc" });

    rerender(<Table sort={{ key: "name", direction: "asc" }} onSortChange={onSortChange} />);
    expect(screen.getByRole("columnheader", { name: /name/i })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(screen.getByRole("button", { name: /name/i }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "desc" });

    await userEvent.click(screen.getByRole("button", { name: /email/i }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "mail", direction: "asc" });
  });

  it("shows the empty state with overridable copy", () => {
    render(<Table rows={[]} emptyTitle="No users" emptyMessage="Invite someone." />);
    expect(screen.getByText("No users")).toBeInTheDocument();
    expect(screen.getByText("Invite someone.")).toBeInTheDocument();
  });

  it("shows the error state with a retry", async () => {
    const onRetry = vi.fn();
    render(<Table error="Server down" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Server down");
    expect(screen.queryByText("Ada")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("shows a spinner on first load, and keeps rows during a refetch", () => {
    const { rerender } = render(<Table rows={[]} loading />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    rerender(<Table loading />);
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /name/i })).toBeDisabled();
  });

  it("selects rows and all rows, keeping keys from other pages", async () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(<Table selectedKeys={[99]} onSelectionChange={onSelectionChange} />);
    await userEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]!);
    expect(onSelectionChange).toHaveBeenLastCalledWith([99, 1]);

    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([99, 1, 2]);

    rerender(<Table selectedKeys={[99, 1]} onSelectionChange={onSelectionChange} />);
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toHaveProperty("indeterminate", true);

    rerender(<Table selectedKeys={[99, 1, 2]} onSelectionChange={onSelectionChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([99]);
  });

  it("calls onRowClick by mouse and keyboard, but not from the checkbox", async () => {
    const onRowClick = vi.fn();
    render(<Table onRowClick={onRowClick} onSelectionChange={() => {}} />);
    await userEvent.click(screen.getByText("Linus"));
    expect(onRowClick).toHaveBeenLastCalledWith(users[1]);

    await userEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]!);
    expect(onRowClick).toHaveBeenCalledTimes(1);

    screen.getAllByRole("row")[1]!.focus();
    await userEvent.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenLastCalledWith(users[0]);
  });

  it("renders pagination when given", async () => {
    const onPageChange = vi.fn();
    render(<Table pagination={{ page: 1, pageSize: 2, total: 6, onPageChange }} />);
    await userEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
