"use client";

import { useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type EditorValue = {
  text: string;
  content: JSONContent;
};

type RichEditorProps = {
  onChange: (value: EditorValue) => void;
  resetKey: number;
  overLimit: boolean;
};

const starterKit = StarterKit.configure({
  heading: false,
  blockquote: false,
  codeBlock: false,
  horizontalRule: false,
});

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={[
        "grid size-9 place-items-center rounded-xl border text-zinc-300 transition",
        active
          ? "border-violet-400/40 bg-violet-400/15 text-violet-100"
          : "border-transparent hover:border-white/10 hover:bg-white/[0.07] hover:text-white",
        disabled ? "cursor-not-allowed opacity-30" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return <div className="h-9" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <ToolbarButton
        label="Жирный"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Курсив"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Зачёркнутый"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-white/10" />

      <ToolbarButton
        label="Маркированный список"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Нумерованный список"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-white/10" />

      <ToolbarButton
        label="Отменить"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Повторить"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichEditor({
  onChange,
  resetKey,
  overLimit,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [starterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "notebook-editor",
        "aria-label": "Текст заметки",
      },
    },
    onUpdate: ({ editor }) => {
      onChange({
        text: editor.getText({ blockSeparator: "\n" }),
        content: editor.getJSON(),
      });
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.clearContent(true);
  }, [editor, resetKey]);

  return (
    <div
      className={[
        "editor-shell overflow-hidden rounded-2xl border bg-black/20 transition-all duration-300",
        overLimit
          ? "limit-over border-rose-400/50"
          : "border-white/10 focus-within:border-violet-400/35 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]",
      ].join(" ")}
    >
      <div className="border-b border-white/10 bg-white/[0.025] px-3 py-2">
        <EditorToolbar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
