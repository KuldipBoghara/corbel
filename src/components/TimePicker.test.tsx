import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TimePicker, formatTime, parseTime, to24Hour } from "./TimePicker.js";

describe("time conversion", () => {
  it("formats 24-hour values for display", () => {
    expect(formatTime("00:05")).toBe("12:05 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("14:30")).toBe("02:30 PM");
    expect(formatTime("14:30", 24)).toBe("14:30");
    expect(formatTime("")).toBe("");
    expect(formatTime("25:00")).toBe("");
  });

  it("converts 12-hour parts to 24-hour hours", () => {
    expect(to24Hour(12, "AM")).toBe(0);
    expect(to24Hour(12, "PM")).toBe(12);
    expect(to24Hour(2, "PM")).toBe(14);
    expect(to24Hour(11, "AM")).toBe(11);
    expect(parseTime("9:05")).toEqual({ hours: 9, minutes: 5 });
  });
});

describe("TimePicker", () => {
  const open = async (label = "Start") => {
    await userEvent.click(screen.getByLabelText(label));
    return screen.getByRole("dialog");
  };

  it("shows the value in 12-hour form and emits 24-hour values", async () => {
    const onChange = vi.fn();
    render(<TimePicker label="Start" value="14:30" onChange={onChange} />);
    expect(screen.getByLabelText("Start")).toHaveTextContent("02:30 PM");
    const panel = await open();

    await userEvent.click(within(within(panel).getByRole("group", { name: "Hour" })).getByRole("button", { name: "09" }));
    expect(onChange).toHaveBeenLastCalledWith("21:30");

    await userEvent.click(within(panel).getByRole("button", { name: "AM" }));
    expect(onChange).toHaveBeenLastCalledWith("02:30");
  });

  it("starts from 12:00 AM when empty", async () => {
    const onChange = vi.fn();
    render(<TimePicker label="Start" value="" onChange={onChange} />);
    expect(screen.getByLabelText("Start")).toHaveTextContent("Select time");
    const panel = await open();
    await userEvent.click(within(within(panel).getByRole("group", { name: "Min" })).getByRole("button", { name: "15" }));
    expect(onChange).toHaveBeenCalledWith("00:15");
  });

  it("supports 24-hour display and minute steps", async () => {
    const onChange = vi.fn();
    render(<TimePicker label="Start" value="08:00" hourCycle={24} step={15} onChange={onChange} />);
    const panel = await open();
    const minutes = within(within(panel).getByRole("group", { name: "Min" })).getAllByRole("button");
    expect(minutes.map((b) => b.textContent)).toEqual(["00", "15", "30", "45"]);
    expect(within(panel).queryByRole("group", { name: "AM/PM" })).not.toBeInTheDocument();
    await userEvent.click(within(within(panel).getByRole("group", { name: "Hour" })).getByRole("button", { name: "17" }));
    expect(onChange).toHaveBeenCalledWith("17:00");
  });
});
