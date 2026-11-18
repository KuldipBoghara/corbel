import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { Tabs, type TabItem } from "./Tabs.js";
import { SideTabs } from "./SideTabs.js";

const items: TabItem[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Gamma", count: 3 },
  { value: "d", label: "Delta" },
];

function Harness({ side = false }: { side?: boolean }) {
  const [value, setValue] = useState("a");
  const Comp = side ? SideTabs : Tabs;
  return <Comp items={items} value={value} onChange={setValue} id="t" />;
}

describe("Tabs", () => {
  it("uses a roving tabindex and ARIA tab roles", () => {
    render(<Harness />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");
    expect(tabs[0]).toHaveAttribute("aria-controls", "t-panel-a");
  });

  it.each([false, true])("moves with arrows, Home and End, skipping disabled (side=%s)", async (side) => {
    render(<Harness side={side} />);
    const tab = (name: string) => screen.getByRole("tab", { name: new RegExp(name) });

    await userEvent.tab();
    expect(tab("Alpha")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(tab("Gamma")).toHaveFocus();
    expect(tab("Gamma")).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{End}");
    expect(tab("Delta")).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowRight}");
    expect(tab("Alpha")).toHaveFocus();

    await userEvent.keyboard("{ArrowLeft}");
    expect(tab("Delta")).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(tab("Alpha")).toHaveAttribute("aria-selected", "true");
    expect(tab("Alpha")).toHaveAttribute("tabindex", "0");
  });
});
