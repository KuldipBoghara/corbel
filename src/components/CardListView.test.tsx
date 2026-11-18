import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CardListView } from "./CardListView.js";

type Dept = { id: string; name: string; active: boolean };
const rows: Dept[] = [
  { id: "a", name: "Cardiology", active: true },
  { id: "b", name: "Radiology", active: false },
];

describe("CardListView", () => {
  it("expands a row and runs per-row actions without toggling it", async () => {
    const onToggle = vi.fn();
    render(
      <CardListView
        rows={rows}
        getRowKey={(d) => d.id}
        renderTitle={(d) => d.name}
        renderExpanded={(d) => <p>Details of {d.name}</p>}
        actions={[
          {
            key: "toggle",
            label: (d) => (d.active ? "Deactivate" : "Activate"),
            icon: "x",
            onClick: onToggle,
          },
        ]}
      />,
    );
    const [expandA] = screen.getAllByRole("button", { name: "Expand" });
    await userEvent.click(expandA!);
    expect(screen.getByText("Details of Cardiology")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse" })).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByRole("button", { name: "Activate" }));
    expect(onToggle).toHaveBeenCalledWith(rows[1]);
    expect(screen.queryByText("Details of Radiology")).not.toBeInTheDocument();
  });

  it("shows drag grips only with onReorder, and the empty state", () => {
    const { rerender } = render(
      <CardListView rows={rows} getRowKey={(d) => d.id} renderTitle={(d) => d.name} onReorder={() => {}} />,
    );
    expect(screen.getAllByRole("button", { name: "Drag to reorder" })).toHaveLength(2);
    rerender(<CardListView rows={[]} getRowKey={(d: Dept) => d.id} renderTitle={(d) => d.name} emptyTitle="No departments" />);
    expect(screen.getByText("No departments")).toBeInTheDocument();
  });
});
