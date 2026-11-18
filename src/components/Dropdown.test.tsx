import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Dropdown } from "./Dropdown.js";

const options = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana", description: "Yellow", image: "/b.png" },
  { value: "c", label: "Cherry", disabled: true },
];

describe("Dropdown", () => {
  it("links the label and shows the selected label", () => {
    render(<Dropdown label="Fruit" options={options} value="a" onChange={() => {}} error="Pick one" />);
    const input = screen.getByLabelText("Fruit");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/Pick one/);
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("selects an option and reports the plain value and the option", async () => {
    const onChange = vi.fn();
    render(<Dropdown label="Fruit" options={options} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Fruit"));
    expect(screen.getByText("Yellow")).toBeInTheDocument(); // description in the menu
    await userEvent.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenCalledWith("b", options[1]);
  });

  it("does not select disabled options", async () => {
    const onChange = vi.fn();
    render(<Dropdown label="Fruit" options={options} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Fruit"));
    await userEvent.click(screen.getByText("Cherry"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("returns arrays in multiple mode", async () => {
    const onChange = vi.fn();
    render(<Dropdown multiple label="Fruit" options={options} value={["a"]} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Fruit"));
    await userEvent.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenCalledWith(["a", "b"], [options[0], options[1]]);
  });

  it("creates a value from typed text", async () => {
    const onChange = vi.fn();
    const onCreateOption = vi.fn();
    render(
      <Dropdown
        creatable
        label="Fruit"
        options={options}
        value={null}
        onChange={onChange}
        onCreateOption={onCreateOption}
      />,
    );
    await userEvent.type(screen.getByLabelText("Fruit"), "Mango");
    await userEvent.click(screen.getByText('Add "Mango"'));
    expect(onCreateOption).toHaveBeenCalledWith("Mango");
    expect(onChange).toHaveBeenCalledWith("Mango", { value: "Mango", label: "Mango" });
  });

  it("loads options asynchronously", async () => {
    const loadOptions = vi.fn(async (q: string) =>
      [{ value: 1, label: "Ann" }, { value: 2, label: "Bob" }].filter((o) => o.label.toLowerCase().includes(q)),
    );
    const onChange = vi.fn();
    render(<Dropdown<number> label="User" loadOptions={loadOptions} value={null} onChange={onChange} />);
    expect(loadOptions).toHaveBeenCalledWith("");
    await userEvent.type(screen.getByLabelText("User"), "bo");
    await userEvent.click(await screen.findByText("Bob", {}, { timeout: 2000 }));
    expect(onChange).toHaveBeenCalledWith(2, { value: 2, label: "Bob" });
  });
});
