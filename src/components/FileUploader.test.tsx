import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { FileUploader, type FileItem, type UploadHandler } from "./FileUploader.js";

const user = userEvent.setup({ applyAccept: false });
const fileInput = (container: HTMLElement) => container.querySelector<HTMLInputElement>('input[type="file"]')!;
const makeFile = (name: string, type: string, size = 10) => new File(["x".repeat(size)], name, { type });

function Multi(props: { onUpload?: UploadHandler; onChange?: (v: FileItem[]) => void; initial?: FileItem[] } & Record<string, unknown>) {
  const { initial = [], onChange, ...rest } = props;
  const [value, setValue] = useState<FileItem[]>(initial);
  return (
    <FileUploader
      {...rest}
      multiple
      label="Files"
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("FileUploader", () => {
  it("rejects files that are too large or of the wrong type via onError", async () => {
    const onError = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      <Multi accept="image/*,.pdf" maxSize={100} onError={onError} onChange={onChange} />,
    );
    await user.upload(fileInput(container), [
      makeFile("big.png", "image/png", 500),
      makeFile("notes.txt", "text/plain"),
      makeFile("ok.pdf", "application/pdf"),
    ]);
    expect(onError).toHaveBeenCalledWith("big.png is larger than 100 B.");
    expect(onError).toHaveBeenCalledWith("notes.txt: this file type is not allowed.");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0]![0] as File[]).map((f) => f.name)).toEqual(["ok.pdf"]);
  });

  it("enforces maxFiles", async () => {
    const onError = vi.fn();
    const { container } = render(<Multi maxFiles={1} onError={onError} />);
    await user.upload(fileInput(container), [makeFile("a.png", "image/png"), makeFile("b.png", "image/png")]);
    expect(onError).toHaveBeenCalledWith("You can add up to 1 files.");
    expect(screen.getByText("a.png")).toBeInTheDocument();
    expect(screen.queryByText("b.png")).not.toBeInTheDocument();
  });

  it("uploads with progress, then hands the result to onChange", async () => {
    let finish!: () => void;
    const onUpload = vi.fn<UploadHandler>(
      (file, { onProgress }) =>
        new Promise((resolve) => {
          onProgress(40);
          finish = () => resolve({ url: "https://cdn.test/a.pdf", name: file.name, id: "f1" });
        }),
    );
    const onChange = vi.fn();
    const onUploadingChange = vi.fn();
    const { container } = render(
      <Multi onUpload={onUpload} onChange={onChange} onUploadingChange={onUploadingChange} />,
    );
    await user.upload(fileInput(container), makeFile("a.pdf", "application/pdf"));

    expect(onUpload).toHaveBeenCalledWith(expect.any(File), expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(screen.getByRole("progressbar", { name: /uploading a\.pdf/i })).toHaveAttribute("aria-valuenow", "40");
    expect(onUploadingChange).toHaveBeenLastCalledWith(true);

    await act(async () => finish());
    expect(onChange).toHaveBeenCalledWith([{ url: "https://cdn.test/a.pdf", name: "a.pdf", id: "f1" }]);
    expect(screen.getByRole("link", { name: "a.pdf" })).toHaveAttribute("href", "https://cdn.test/a.pdf");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(onUploadingChange).toHaveBeenLastCalledWith(false);
  });

  it("shows a failed upload with retry", async () => {
    const onUpload = vi
      .fn<UploadHandler>()
      .mockRejectedValueOnce(new Error("Server said no"))
      .mockResolvedValueOnce({ url: "/a.pdf", name: "a.pdf" });
    const onError = vi.fn();
    const onChange = vi.fn();
    const { container } = render(<Multi onUpload={onUpload} onError={onError} onChange={onChange} />);
    await user.upload(fileInput(container), makeFile("a.pdf", "application/pdf"));

    expect(await screen.findByText("Server said no")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith("a.pdf: Server said no");
    await user.click(screen.getByRole("button", { name: /retry a\.pdf/i }));
    expect(await screen.findByRole("link", { name: "a.pdf" })).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith([{ url: "/a.pdf", name: "a.pdf" }]);
  });

  it("removes a file and calls onRemove", async () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    const stored = [
      { url: "/a.pdf", name: "a.pdf", id: "1" },
      { url: "/b.pdf", name: "b.pdf", id: "2" },
    ];
    render(<Multi initial={stored} onChange={onChange} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: "Remove a.pdf" }));
    expect(onChange).toHaveBeenCalledWith([stored[1]]);
    expect(onRemove).toHaveBeenCalledWith(stored[0]);
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument();
  });

  it("puts the file back when onRemove rejects", async () => {
    const onError = vi.fn();
    render(
      <Multi
        initial={[{ url: "/a.pdf", name: "a.pdf" }]}
        onRemove={() => Promise.reject(new Error("Delete failed"))}
        onError={onError}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Remove a.pdf" }));
    expect(await screen.findByText("a.pdf")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith("Delete failed");
  });

  it("single mode without onUpload hands back the File (file picker)", async () => {
    function Single() {
      const [file, setFile] = useState<FileItem | null>(null);
      return <FileUploader label="Report" variant="button" value={file} onChange={setFile} />;
    }
    const { container } = render(<Single />);
    expect(screen.getByRole("button", { name: /^report/i })).toBeInTheDocument();
    await user.upload(fileInput(container), makeFile("report.pdf", "application/pdf", 2048));
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
    // Full: the trigger is gone until the file is removed.
    expect(screen.queryByRole("button", { name: /^report/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove report.pdf" }));
    expect(screen.getByRole("button", { name: /^report/i })).toBeInTheDocument();
  });

  it("shows image thumbnails in the photo grid", () => {
    render(
      <FileUploader
        multiple
        variant="tile"
        display="grid"
        value={[{ url: "https://cdn.test/p.jpg", name: "p.jpg", type: "image/jpeg" }]}
      />,
    );
    expect(screen.getByRole("img", { name: "p.jpg" })).toHaveAttribute("src", "https://cdn.test/p.jpg");
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
