import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

export interface OutlineItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

interface Props {
  editor: Editor | null;
  visible: boolean;
}

function collectHeadings(editor: Editor | null): OutlineItem[] {
  if (!editor) return [];
  const items: OutlineItem[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      items.push({
        id: `h-${pos}`,
        level: node.attrs.level as number,
        text: node.textContent || "(sans titre)",
        pos,
      });
    }
  });
  return items;
}

export function OutlinePanel({ editor, visible }: Props) {
  const [items, setItems] = useState<OutlineItem[]>([]);

  useEffect(() => {
    if (!editor) return;
    const refresh = () => setItems(collectHeadings(editor));
    refresh();
    editor.on("update", refresh);
    return () => {
      editor.off("update", refresh);
    };
  }, [editor]);

  if (!visible) return null;

  return (
    <aside className="mord-outline" aria-label="Plan du document">
      <div className="mord-outline-title">Navigation</div>
      {items.length === 0 ? (
        <p className="mord-outline-empty">Aucun titre</p>
      ) : (
        <ul className="mord-outline-list">
          {items.map((item) => (
            <li key={item.id} data-level={item.level}>
              <button
                type="button"
                className="mord-outline-item"
                onClick={() => {
                  editor
                    ?.chain()
                    .focus()
                    .setTextSelection(item.pos + 1)
                    .scrollIntoView()
                    .run();
                }}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
