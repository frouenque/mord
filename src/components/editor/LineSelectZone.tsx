import type { Editor } from "@tiptap/react";
import { useCallback, type MouseEvent, type RefObject } from "react";

interface Props {
  editor: Editor | null;
  pageRef: RefObject<HTMLElement | null>;
  onSelectionUpdate?: () => void;
}

function selectBlockAtPos(editor: Editor, pos: number) {
  const doc = editor.state.doc;
  const $pos = doc.resolve(Math.min(Math.max(pos, 0), doc.content.size));
  const depth = Math.max($pos.depth, 1);
  const from = $pos.start(depth);
  const to = $pos.end(depth);
  editor.chain().focus().setTextSelection({ from, to }).run();
}

/**
 * Zone « barre de sélection » Word : du panneau latéral jusqu’au début du texte.
 * Curseur = flèche standard miroir (pointe en haut à droite).
 */
export function LineSelectZone({ editor, pageRef, onSelectionUpdate }: Props) {
  const onMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!editor || e.button !== 0) return;
      const page = pageRef.current;
      const prose = page?.querySelector(".ProseMirror") as HTMLElement | null;
      if (!page || !prose) return;

      const proseRect = prose.getBoundingClientRect();
      // Position dans le flux texte (bord gauche du contenu)
      const coords = editor.view.posAtCoords({
        left: proseRect.left + 4,
        top: e.clientY,
      });
      if (!coords) return;

      e.preventDefault();
      e.stopPropagation();
      selectBlockAtPos(editor, coords.pos);
      onSelectionUpdate?.();
    },
    [editor, pageRef, onSelectionUpdate],
  );

  return (
    <div
      className="mord-line-select-zone"
      title="Cliquer pour sélectionner la ligne"
      onMouseDown={onMouseDown}
      aria-hidden
    />
  );
}
