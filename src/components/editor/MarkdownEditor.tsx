import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { editorExtensions } from "./extensions";

export interface MarkdownEditorHandle {
  getMarkdown: () => string;
  setMarkdown: (md: string) => void;
  focus: () => void;
  editor: Editor | null;
}

interface Props {
  initialContent?: string;
  onUpdate?: (markdown: string) => void;
  onReady?: (editor: Editor) => void;
  onSelectionUpdate?: () => void;
}

function getMarkdownFrom(editor: Editor | null): string {
  if (!editor) return "";
  const storage = editor.storage as {
    markdown?: { getMarkdown: () => string };
  };
  return storage.markdown?.getMarkdown() ?? "";
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, Props>(
  function MarkdownEditor(
    { initialContent = "", onUpdate, onReady, onSelectionUpdate },
    ref,
  ) {
    const editor = useEditor({
      extensions: editorExtensions,
      content: initialContent,
      editorProps: {
        attributes: {
          class: "mord-prose",
          spellcheck: "true",
          lang: "fr",
        },
      },
      onCreate: ({ editor: ed }) => {
        onReady?.(ed);
      },
      onUpdate: ({ editor: ed }) => {
        onUpdate?.(getMarkdownFrom(ed));
      },
      onSelectionUpdate: () => {
        onSelectionUpdate?.();
      },
    });

    useEffect(() => {
      if (!editor) return;
      const current = getMarkdownFrom(editor);
      if (current !== initialContent) {
        // emitUpdate: false évite de marquer le document comme modifié au chargement
        editor.commands.setContent(initialContent, { emitUpdate: false });
      }
      // intentionally only when document is reloaded from parent
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialContent]);

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => getMarkdownFrom(editor),
        setMarkdown: (md: string) => {
          editor?.commands.setContent(md);
        },
        focus: () => {
          editor?.commands.focus();
        },
        editor,
      }),
      [editor],
    );

    return (
      <div className="mord-editor-surface">
        <EditorContent editor={editor} />
      </div>
    );
  },
);
