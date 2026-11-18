import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Accordion } from "./Accordion.js";

const items = [
  { id: "one", title: "One", content: "First answer" },
  { id: "two", title: "Two", content: "Second answer" },
];

const btn = (name: string) => screen.getByRole("button", { name });

describe("Accordion", () => {
  it("opens one item at a time by default", async () => {
    render(<Accordion items={items} />);
    expect(btn("One")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("First answer")).not.toBeVisible();

    await userEvent.click(btn("One"));
    expect(btn("One")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "One" })).toHaveTextContent("First answer");

    await userEvent.click(btn("Two"));
    expect(btn("One")).toHaveAttribute("aria-expanded", "false");
    expect(btn("Two")).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(btn("Two"));
    expect(btn("Two")).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps several open with multiple", async () => {
    const onChange = vi.fn();
    render(<Accordion items={items} multiple defaultValue={["one"]} onChange={onChange} />);
    await userEvent.click(btn("Two"));
    expect(btn("One")).toHaveAttribute("aria-expanded", "true");
    expect(btn("Two")).toHaveAttribute("aria-expanded", "true");
    expect(onChange).toHaveBeenLastCalledWith(["one", "two"]);
  });

  it("follows the value prop when controlled", async () => {
    const onChange = vi.fn();
    render(<Accordion items={items} value={["two"]} onChange={onChange} />);
    await userEvent.click(btn("One"));
    expect(onChange).toHaveBeenCalledWith(["one"]);
    expect(btn("One")).toHaveAttribute("aria-expanded", "false");
    expect(btn("Two")).toHaveAttribute("aria-expanded", "true");
  });
});
