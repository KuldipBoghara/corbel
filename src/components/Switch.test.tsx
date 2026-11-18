import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Switch } from "./Switch.js";

describe("Switch", () => {
  it("reports the new state as a boolean, by click and by Space", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Switch label="Alerts" checked={false} onChange={onChange} />);
    const sw = screen.getByRole("switch", { name: "Alerts" });
    expect(sw).not.toBeChecked();
    await userEvent.click(screen.getByText("Alerts"));
    expect(onChange).toHaveBeenLastCalledWith(true);

    rerender(<Switch label="Alerts" checked onChange={onChange} />);
    expect(sw).toBeChecked();
    sw.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("does not toggle while disabled or loading", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Switch aria-label="x" checked={false} onChange={onChange} disabled />,
    );
    await userEvent.click(screen.getByRole("switch"));
    rerender(<Switch aria-label="x" checked={false} onChange={onChange} loading />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-busy", "true");
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("links the description", () => {
    render(<Switch label="Alerts" description="Daily digest" checked={false} />);
    expect(screen.getByRole("switch")).toHaveAccessibleDescription("Daily digest");
  });
});
