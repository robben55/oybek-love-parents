"use client";

import { useEffect } from "react";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const starterKit = StarterKit.configure({
  heading: false,
  blockquote: false,
  codeBlock: false,
  horizontalRule: false,
});

export function NotePreview({ content }: { content: JSONContent }) {
  const editor = useEditor({
    extensions: [starterKit],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "note-preview",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  return <EditorContent editor={editor} />;
}
