import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Menu, type MenuProps } from "./Menu.js";

function setup(props: Partial<MenuProps> = {}) {
  const edit = vi.fn();
  const remove = vi.fn();
  render(
    <Menu
      trigger={<button>Actions</button>}
      items={[
        { label: "Edit", onSelect: edit },
        { label: "Archive", onSelect: vi.fn(), disabled: true },
        false,
        { type: "separator" },
        { label: "Delete", tone: "danger", onSelect: remove },
      ]}
      {...props}
    />,
  );
  return { edit, remove, trigger: screen.getByRole("button", { name: "Actions" }) };
}

describe("Menu", () => {
  it("opens on click with ARIA wiring and focuses the first item", async () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
  });

  it("arrow keys skip disabled items and wrap; Escape closes and refocuses the trigger", async () => {
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("selecting an item calls onSelect, closes and refocuses the trigger", async () => {
    const { trigger, remove } = setup();
    trigger.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(remove).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on outside click and on a second trigger click", async () => {
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.click(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
