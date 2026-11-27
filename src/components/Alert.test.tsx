import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Alert } from "./Alert.js";

describe("Alert", () => {
  it("uses role=alert for errors and warnings, role=status otherwise", () => {
    render(
      <>
        <Alert tone="error" title="Failed" />
        <Alert tone="success" title="Saved" />
      </>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("shows a dismiss button only when onClose is given", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Alert>Body</Alert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();

    rerender(<Alert onClose={onClose}>Body</Alert>);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the icon with icon={false}", () => {
    const { container, rerender } = render(<Alert>Body</Alert>);
    expect(container.querySelector("svg")).toBeInTheDocument();
    rerender(<Alert icon={false}>Body</Alert>);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
