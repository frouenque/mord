import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import type { ThemeMode } from "../../lib/theme";

export type RibbonTab = "fichier" | "accueil" | "insertion" | "affichage";

interface Props {
  tab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  editor: Editor | null;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  outlineVisible: boolean;
  onToggleOutline: () => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onFind: () => void;
}

function Btn({
  title,
  active,
  disabled,
  onClick,
  children,
  wide,
  className = "",
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`mord-rbtn${active ? " is-active" : ""}${wide ? " is-wide" : ""}${className ? ` ${className}` : ""}`}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mord-rgroup">
      <div className="mord-rgroup-body">{children}</div>
      <div className="mord-rgroup-label">{label}</div>
    </div>
  );
}

function StyleCard({
  label,
  previewClass,
  active,
  onClick,
}: {
  label: string;
  previewClass: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`mord-style-card${active ? " is-active" : ""}`}
      onClick={onClick}
      title={label}
    >
      <span className={`mord-style-preview ${previewClass}`}>AaBbCc</span>
      <span className="mord-style-name">{label}</span>
    </button>
  );
}

export function Ribbon(props: Props) {
  const {
    tab,
    onTabChange,
    editor,
    themeMode,
    onThemeChange,
    outlineVisible,
    onToggleOutline,
    onNew,
    onOpen,
    onSave,
    onSaveAs,
    onInsertLink,
    onInsertImage,
    onFind,
  } = props;

  const setHeading = (level: number | 0) => {
    if (!editor) return;
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
        .run();
    }
  };

  const isH = (level: number) => !!editor?.isActive("heading", { level });
  const isNormal = !!editor && !editor.isActive("heading");

  return (
    <div className="mord-ribbon">
      <div className="mord-ribbon-tabs">
        <button
          type="button"
          className={`mord-rtab mord-rtab-file${tab === "fichier" ? " is-active" : ""}`}
          onClick={() => onTabChange("fichier")}
        >
          Fichier
        </button>
        {(
          [
            ["accueil", "Accueil"],
            ["insertion", "Insertion"],
            ["affichage", "Affichage"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`mord-rtab${tab === id ? " is-active" : ""}`}
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mord-ribbon-body">
        {tab === "fichier" && (
          <Group label="Document">
            <Btn title="Nouveau (Ctrl+N)" wide onClick={onNew}>
              <span className="mord-ricon">📄</span>
              <span>Nouveau</span>
            </Btn>
            <Btn title="Ouvrir (Ctrl+O)" wide onClick={onOpen}>
              <span className="mord-ricon">📂</span>
              <span>Ouvrir</span>
            </Btn>
            <Btn title="Enregistrer (Ctrl+S)" wide onClick={onSave}>
              <span className="mord-ricon">💾</span>
              <span>Enregistrer</span>
            </Btn>
            <Btn title="Enregistrer sous" wide onClick={onSaveAs}>
              <span className="mord-ricon">💾</span>
              <span>Enreg. sous</span>
            </Btn>
          </Group>
        )}

        {tab === "accueil" && (
          <>
            {/* Coller / Copier — Couper et pinceau exclus (croix) */}
            <Group label="Presse-papiers">
              <Btn
                title="Coller"
                wide
                className="mord-paste"
                onClick={() => document.execCommand("paste")}
              >
                <span className="mord-ricon mord-paste-ico">📋</span>
                <span>Coller</span>
              </Btn>
              <Btn title="Copier" onClick={() => document.execCommand("copy")}>
                ⧉
              </Btn>
            </Group>

            {/* Gras / Italique seulement — reste police exclus ou non-MD */}
            <Group label="Police">
              <Btn
                title="Gras (Ctrl+B)"
                active={!!editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <strong>G</strong>
              </Btn>
              <Btn
                title="Italique (Ctrl+I)"
                active={!!editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <em>I</em>
              </Btn>
              <Btn
                title="Code inline"
                active={!!editor?.isActive("code")}
                onClick={() => editor?.chain().focus().toggleCode().run()}
              >
                {"</>"}
              </Btn>
            </Group>

            {/* Galerie de styles MD (équiv. Word Styles) */}
            <Group label="Styles">
              <div className="mord-styles-gallery">
                <StyleCard
                  label="Normal"
                  previewClass="is-normal"
                  active={isNormal}
                  onClick={() => setHeading(0)}
                />
                <StyleCard
                  label="Titre 1"
                  previewClass="is-h1"
                  active={isH(1)}
                  onClick={() => setHeading(1)}
                />
                <StyleCard
                  label="Titre 2"
                  previewClass="is-h2"
                  active={isH(2)}
                  onClick={() => setHeading(2)}
                />
                <StyleCard
                  label="Titre 3"
                  previewClass="is-h3"
                  active={isH(3)}
                  onClick={() => setHeading(3)}
                />
              </div>
            </Group>
          </>
        )}

        {tab === "insertion" && (
          <>
            {/* Listes / structure MD — hors Accueil car croix Word sur puces */}
            <Group label="Listes">
              <Btn
                title="Liste à puces"
                active={!!editor?.isActive("bulletList")}
                wide
                onClick={() =>
                  editor?.chain().focus().toggleBulletList().run()
                }
              >
                • Liste
              </Btn>
              <Btn
                title="Liste numérotée"
                active={!!editor?.isActive("orderedList")}
                wide
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
              >
                1. Liste
              </Btn>
              <Btn
                title="Liste de tâches"
                active={!!editor?.isActive("taskList")}
                wide
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
              >
                ☑ Tâches
              </Btn>
              <Btn
                title="Citation"
                active={!!editor?.isActive("blockquote")}
                wide
                onClick={() =>
                  editor?.chain().focus().toggleBlockquote().run()
                }
              >
                ❝ Citation
              </Btn>
            </Group>

            <Group label="Tableau">
              <Btn
                title="Insérer un tableau 3×3"
                wide
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                ▦ Tableau
              </Btn>
              <Btn
                title="Ajouter une ligne"
                disabled={!editor?.isActive("table")}
                onClick={() => editor?.chain().focus().addRowAfter().run()}
              >
                +ligne
              </Btn>
              <Btn
                title="Ajouter une colonne"
                disabled={!editor?.isActive("table")}
                onClick={() => editor?.chain().focus().addColumnAfter().run()}
              >
                +col
              </Btn>
              <Btn
                title="Supprimer le tableau"
                disabled={!editor?.isActive("table")}
                onClick={() => editor?.chain().focus().deleteTable().run()}
              >
                ✕
              </Btn>
            </Group>

            <Group label="Objets">
              <Btn title="Lien" wide onClick={onInsertLink}>
                🔗 Lien
              </Btn>
              <Btn title="Image" wide onClick={onInsertImage}>
                🖼 Image
              </Btn>
              <Btn
                title="Bloc de code"
                active={!!editor?.isActive("codeBlock")}
                wide
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              >
                {"</>"} Code
              </Btn>
              <Btn
                title="Ligne horizontale"
                wide
                onClick={() =>
                  editor?.chain().focus().setHorizontalRule().run()
                }
              >
                ― Ligne
              </Btn>
            </Group>
          </>
        )}

        {tab === "affichage" && (
          <>
            <Group label="Afficher">
              <Btn
                title="Volet de navigation"
                active={outlineVisible}
                wide
                onClick={onToggleOutline}
              >
                ☰ Navigation
              </Btn>
              <Btn title="Rechercher (Ctrl+F)" wide onClick={onFind}>
                🔍 Rechercher
              </Btn>
            </Group>
            <Group label="Thème">
              <select
                className="mord-rselect"
                value={themeMode}
                onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
                title="Thème"
              >
                <option value="system">Système</option>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </Group>
          </>
        )}
      </div>
    </div>
  );
}
