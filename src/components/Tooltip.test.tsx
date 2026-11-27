import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Tooltip } from "./Tooltip.js";

describe("Tooltip", () => {
  it("shows on hover after the delay and describes the trigger", async () => {
    render(
      <Tooltip content="Delete row" delay={50}>
        <button>Delete</button>
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    await userEvent.hover(button);
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Delete row");
    expect(button).toHaveAccessibleDescription("Delete row");

    await userEvent.unhover(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows on focus at once and hides on Escape", async () => {
    render(
      <Tooltip content="Help">
        <button>?</button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Help");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("keeps the child's own aria-describedby and shows nothing when disabled or empty", async () => {
    const { rerender } = render(
      <Tooltip content="Tip">
        <button aria-describedby="other">B</button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button").getAttribute("aria-describedby")).toMatch(/^other \S+$/);

    rerender(
      <Tooltip content="Tip" disabled>
        <button>B</button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    rerender(
      <Tooltip content="">
        <button>B</button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
