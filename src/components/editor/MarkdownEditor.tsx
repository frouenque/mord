import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
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
    const skipNextContentSync = useRef(false);

    const editor = useEditor({
      extensions: editorExtensions,
      content: initialContent,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "mord-prose",
          spellcheck: "true",
          lang: "fr",
        },
      },
      onUpdate: ({ editor: ed }) => {
        skipNextContentSync.current = true;
        onUpdate?.(getMarkdownFrom(ed));
      },
      onSelectionUpdate: () => {
        onSelectionUpdate?.();
      },
    });

    useEffect(() => {
      if (editor) onReady?.(editor);
    }, [editor, onReady]);

    useEffect(() => {
      if (!editor) return;
      if (skipNextContentSync.current) {
        skipNextContentSync.current = false;
        return;
      }
      const current = getMarkdownFrom(editor);
      if (current !== initialContent) {
        editor.commands.setContent(initialContent, { emitUpdate: false });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialContent]);

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => getMarkdownFrom(editor),
        setMarkdown: (md: string) => {
          skipNextContentSync.current = true;
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
