import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Drawer } from "./Drawer.js";

describe("Drawer", () => {
  it("is a labelled modal dialog that closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters">
        body
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("pins the panel to the chosen side, overriding the centred modal layout", () => {
    const { rerender } = render(<Drawer open onClose={() => {}} title="Nav" placement="left" size="sm" />);
    let panel = screen.getByRole("dialog");
    expect(panel).toHaveClass("fixed", "left-0", "max-w-sm", "rounded-none");
    expect(panel).not.toHaveClass("relative", "rounded-2xl", "max-w-none", "animate-corbel-fade-in");

    rerender(<Drawer open onClose={() => {}} title="Nav" className="max-w-lg" />);
    panel = screen.getByRole("dialog");
    expect(panel).toHaveClass("right-0", "max-w-lg");
    expect(panel).not.toHaveClass("max-w-md");
  });
});
