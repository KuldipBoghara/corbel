import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TextEditor } from "./TextEditor.js";

// jsdom has no layout; ProseMirror measures the selection when scrolling it into view.
const emptyRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
Range.prototype.getClientRects = emptyRects;
Range.prototype.getBoundingClientRect = () => new DOMRect();
Element.prototype.getClientRects = emptyRects;
document.elementFromPoint = () => null;

describe("TextEditor", () => {
  it("renders the value with label and error wiring", async () => {
    render(<TextEditor label="Description" error="Required" value="<p>Hello world</p>" />);
    const box = await screen.findByRole("textbox", { name: "Description" });
    expect(box).toHaveTextContent("Hello world");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Required");
  });

  it("reports HTML through onChange when formatting is applied", async () => {
    const onChange = vi.fn();
    render(<TextEditor label="Body" value="<p>Title</p>" onChange={onChange} />);
    await userEvent.click(await screen.findByRole("button", { name: "Heading 1" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^<h1>Title<\/h1>/));
    expect(screen.getByRole("button", { name: "Heading 1" })).toHaveAttribute("aria-pressed", "true");
  });

  it("hides the toolbar when disabled and the image button without onImageUpload", async () => {
    const { rerender } = render(<TextEditor label="Body" value="<p>x</p>" />);
    await screen.findByRole("toolbar");
    expect(screen.queryByRole("button", { name: "Insert image" })).not.toBeInTheDocument();
    rerender(<TextEditor label="Body" value="<p>x</p>" onImageUpload={async () => "/a.png"} />);
    expect(screen.getByRole("button", { name: "Insert image" })).toBeInTheDocument();
    rerender(<TextEditor label="Body" value="<p>x</p>" disabled />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
});
