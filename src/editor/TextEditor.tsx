"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo2,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  Undo2,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { FormField, Label, type FieldProps, type FieldSlot } from "../components/FormField.js";

export type TextEditorSlot = FieldSlot | "toolbar" | "content";

export interface TextEditorProps extends FieldProps {
  /** HTML. An empty editor reports `""`. */
  value?: string;
  onChange?: (html: string) => void;
  /** @default "Start writing…" */
  placeholder?: string;
  /** Read-only: hides the toolbar and mutes the text. */
  disabled?: boolean;
  /** Minimum height of the writing area. @default 220 */
  minHeight?: number | string;
  /** Waits this many ms after the last keystroke before calling `onChange`. @default 0 */
  debounceMs?: number;
  /**
   * Uploads a picked image and resolves with its URL. The toolbar's image
   * button only appears when this is set.
   */
  onImageUpload?: (file: File) => Promise<string>;
  /** Image upload failures. */
  onError?: (message: string) => void;
  id?: string;
  /** Styles the bordered editor box. Use `classNames` for the other parts. */
  className?: string;
  classNames?: Partial<Record<TextEditorSlot, string>>;
}

/** Typography for the editor's HTML, so it needs no `prose` plugin or extra stylesheet. */
const contentClass = cn(
  "text-sm text-text-primary [&_.ProseMirror]:outline-none",
  "[&_p]:my-2 [&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-semibold",
  "[&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li_p]:my-0.5",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-border-default [&_blockquote]:pl-3 [&_blockquote]:text-text-secondary",
  "[&_code]:rounded [&_code]:bg-bg-main [&_code]:px-1 [&_pre]:rounded-lg [&_pre]:bg-bg-main [&_pre]:p-3",
  "[&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_hr]:my-4 [&_hr]:border-border-default",
  "[&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-primary/40",
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left",
  "[&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-text-muted",
  "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
);

interface ToolProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

function Tool({ label, onClick, active, disabled, children }: ToolProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex cursor-pointer items-center rounded-md p-1.5 text-text-secondary transition-colors",
        "hover:bg-bg-main hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-primary-50 text-primary hover:bg-primary-100 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

const Group = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-0.5 border-r border-border-default pr-1.5 last:border-r-0">{children}</div>
);

function Toolbar({
  editor,
  onImage,
  className,
}: {
  editor: Editor;
  onImage?: () => void;
  className?: string;
}) {
  const chain = () => editor.chain().focus();
  const icon = { size: 16, "aria-hidden": true } as const;

  const setLink = () => {
    const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
    // ponytail: native prompt, swap for a popover if apps need a nicer link dialog.
    const url = window.prompt("Link URL (leave empty to remove)", previous);
    if (url === null) return;
    if (url.trim() === "") chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className={cn("flex flex-wrap gap-1.5 border-b border-border-default bg-bg-main/50 p-1.5", className)}
    >
      <Group>
        <Tool label="Bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
          <Bold {...icon} />
        </Tool>
        <Tool label="Italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
          <Italic {...icon} />
        </Tool>
      </Group>
      <Group>
        {([1, 2, 3] as const).map((level) => {
          const Icon = [Heading1, Heading2, Heading3][level - 1]!;
          return (
            <Tool
              key={level}
              label={`Heading ${level}`}
              active={editor.isActive("heading", { level })}
              onClick={() => chain().toggleHeading({ level }).run()}
            >
              <Icon {...icon} />
            </Tool>
          );
        })}
      </Group>
      <Group>
        {(
          [
            ["left", "Align left", TextAlignStart],
            ["center", "Align center", TextAlignCenter],
            ["right", "Align right", TextAlignEnd],
          ] as const
        ).map(([align, label, Icon]) => (
          <Tool
            key={align}
            label={label}
            active={editor.isActive({ textAlign: align })}
            onClick={() => chain().setTextAlign(align).run()}
          >
            <Icon {...icon} />
          </Tool>
        ))}
      </Group>
      <Group>
        <Tool label="Bullet list" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
          <List {...icon} />
        </Tool>
        <Tool
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => chain().toggleOrderedList().run()}
        >
          <ListOrdered {...icon} />
        </Tool>
      </Group>
      <Group>
        <Tool label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon {...icon} />
        </Tool>
        {onImage && (
          <Tool label="Insert image" onClick={onImage}>
            <ImageIcon {...icon} />
          </Tool>
        )}
      </Group>
      <Group>
        <Tool label="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
          <Undo2 {...icon} />
        </Tool>
        <Tool label="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
          <Redo2 {...icon} />
        </Tool>
      </Group>
    </div>
  );
}

/** Puts label/description/invalid wiring on the contenteditable, which a `<label for>` can't reach. */
function AriaSync({ editor, attributes }: { editor: Editor; attributes: Record<string, string> }) {
  const key = JSON.stringify(attributes);
  useEffect(() => {
    editor.setOptions({ editorProps: { attributes: JSON.parse(key) as Record<string, string> } });
  }, [editor, key]);
  return null;
}

/**
 * Rich-text (HTML) editor built on Tiptap: bold, italic, headings, alignment,
 * lists, links and images. Import it from `corbel/editor`.
 *
 * ```tsx
 * <TextEditor label="Description" value={html} onChange={setHtml} onImageUpload={uploadImage} />
 * ```
 */
export function TextEditor({
  value = "",
  onChange,
  placeholder = "Start writing…",
  label,
  hint,
  error,
  required,
  optional,
  disabled = false,
  minHeight = 220,
  debounceMs = 0,
  onImageUpload,
  onError,
  id,
  className,
  classNames,
}: TextEditorProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const labelId = `${fieldId}-label`;
  const imageInput = useRef<HTMLInputElement>(null);

  // Callbacks and the last value we reported live in refs: Tiptap keeps the
  // handlers it was created with.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const debounceRef = useRef(debounceMs);
  debounceRef.current = debounceMs;
  const lastEmitted = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flush = useRef<() => void>(undefined);

  const editor = useEditor({
    // Render on the client only, so Next.js server rendering doesn't hydrate a mismatch.
    immediatelyRender: false,
    // The toolbar reflects the selection (bold active, undo available …).
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    content: value,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? "" : e.getHTML();
      const send = () => {
        flush.current = undefined;
        if (html === lastEmitted.current) return;
        lastEmitted.current = html;
        onChangeRef.current?.(html);
      };
      clearTimeout(timer.current);
      if (debounceRef.current > 0) {
        flush.current = send;
        timer.current = setTimeout(send, debounceRef.current);
      } else {
        send();
      }
    },
  });

  // Send a debounced change that is still waiting when the editor goes away.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      flush.current?.();
    },
    [],
  );

  // Take outside changes to `value` (form reset, loaded record), but not the
  // echo of what we just reported.
  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    lastEmitted.current = value;
    if (value !== (editor.isEmpty ? "" : editor.getHTML())) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const pickImage = async (file: File | undefined) => {
    if (!file || !editor || !onImageUpload) return;
    try {
      const src = await onImageUpload(file);
      editor.chain().focus().setImage({ src, alt: file.name }).run();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Could not upload that image.");
    }
  };

  return (
    <FormField
      id={fieldId}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      classNames={classNames}
    >
      {({ describedBy, invalid }) => {
        return (
          <>
            {editor && (
              <AriaSync
                editor={editor}
                attributes={{
                  id: fieldId,
                  role: "textbox",
                  "aria-multiline": "true",
                  ...(label ? { "aria-labelledby": labelId } : { "aria-label": placeholder }),
                  ...(describedBy ? { "aria-describedby": describedBy } : {}),
                  ...(invalid ? { "aria-invalid": "true" } : {}),
                  ...(disabled ? { "aria-readonly": "true" } : {}),
                }}
              />
            )}
            {label && (
              <Label
                id={labelId}
                required={required}
                optional={optional}
                className={classNames?.label}
                onClick={() => editor?.commands.focus()}
              >
                {label}
              </Label>
            )}
            <div
              className={cn(
                "overflow-hidden rounded-lg border border-border-default bg-bg-card transition-colors",
                "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
                invalid && "border-error focus-within:border-error focus-within:ring-error/20",
                disabled && "bg-bg-main",
                className,
              )}
            >
              {editor && !disabled && (
                <Toolbar
                  editor={editor}
                  className={classNames?.toolbar}
                  onImage={onImageUpload && (() => imageInput.current?.click())}
                />
              )}
              <EditorContent
                editor={editor}
                onClick={() => editor?.commands.focus()}
                style={{ minHeight }}
                className={cn(
                  "overflow-y-auto px-4 py-3",
                  contentClass,
                  disabled ? "cursor-default text-text-muted" : "cursor-text",
                  classNames?.content,
                )}
              />
            </div>
            {onImageUpload && (
              <input
                ref={imageInput}
                type="file"
                accept="image/*"
                hidden
                tabIndex={-1}
                onChange={(e) => {
                  void pickImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            )}
          </>
        );
      }}
    </FormField>
  );
}
