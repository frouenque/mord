import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LineSelectZone } from "./components/editor/LineSelectZone";
import { Rulers } from "./components/editor/Rulers";
import {
  MarkdownEditor,
  type MarkdownEditorHandle,
} from "./components/editor/MarkdownEditor";
import { OutlinePanel } from "./components/outline/OutlinePanel";
import { Ribbon, type RibbonTab } from "./components/ribbon/Ribbon";
import { StatusBar } from "./components/statusbar/StatusBar";
import { TitleBar } from "./components/titlebar/TitleBar";
import {
  importImage,
  pickImageFile,
  pickOpenMarkdown,
  pickSaveMarkdown,
  readMarkdownFile,
  writeMarkdownFile,
} from "./lib/documentApi";
import {
  applyTheme,
  getStoredTheme,
  storeTheme,
  type ThemeMode,
} from "./lib/theme";

const EMPTY_DOC = "# Nouveau document\n\nCommencez à écrire…\n";
const AUTOSAVE_KEY = "mord.autosave";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function basename(path: string | null): string {
  if (!path) return "Document";
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}

export default function App() {
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const pageRef = useRef<HTMLElement | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [tab, setTab] = useState<RibbonTab>("accueil");
  const [path, setPath] = useState<string | null>(null);
  const [content, setContent] = useState(EMPTY_DOC);
  const [loadedContent, setLoadedContent] = useState(EMPTY_DOC);
  const [dirty, setDirty] = useState(false);
  const [outlineVisible, setOutlineVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme);
  const [tick, setTick] = useState(0);
  const [autosave, setAutosave] = useState(
    () => localStorage.getItem(AUTOSAVE_KEY) === "1",
  );

  useEffect(() => {
    applyTheme(themeMode);
    storeTheme(themeMode);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (themeMode === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(AUTOSAVE_KEY, autosave ? "1" : "0");
  }, [autosave]);

  useEffect(() => {
    void getCurrentWindow().setTitle(
      `${basename(path)}${dirty ? " *" : ""} - Mord`,
    );
  }, [path, dirty]);

  const markDirty = useCallback((md: string) => {
    setContent(md);
    setDirty(true);
  }, []);

  const handleEditorReady = useCallback((ed: Editor) => {
    setEditor(ed);
  }, []);

  const confirmDiscard = () => {
    if (!dirty) return true;
    return window.confirm(
      "Le document a été modifié. Continuer sans enregistrer ?",
    );
  };

  const handleNew = useCallback(() => {
    if (!confirmDiscard()) return;
    setPath(null);
    setContent(EMPTY_DOC);
    setLoadedContent(EMPTY_DOC);
    setDirty(false);
    editorRef.current?.setMarkdown(EMPTY_DOC);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  const handleOpen = useCallback(async () => {
    if (!confirmDiscard()) return;
    const selected = await pickOpenMarkdown();
    if (!selected) return;
    const doc = await readMarkdownFile(selected);
    setPath(doc.path);
    setContent(doc.content);
    setLoadedContent(doc.content);
    setDirty(false);
    editorRef.current?.setMarkdown(doc.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  const saveTo = useCallback(async (target: string) => {
    const md = editorRef.current?.getMarkdown() ?? content;
    const doc = await writeMarkdownFile(target, md);
    setPath(doc.path);
    setContent(doc.content);
    setLoadedContent(doc.content);
    setDirty(false);
  }, [content]);

  const handleSaveAs = useCallback(async () => {
    const selected = await pickSaveMarkdown(path ?? "document.md");
    if (!selected) return;
    const finalPath = selected.toLowerCase().endsWith(".md")
      ? selected
      : `${selected}.md`;
    await saveTo(finalPath);
  }, [path, saveTo]);

  const handleSave = useCallback(async () => {
    if (path) {
      await saveTo(path);
      return;
    }
    await handleSaveAs();
  }, [path, saveTo, handleSaveAs]);

  // Autosave toutes les 2s si activé et fichier déjà nommé
  useEffect(() => {
    if (!autosave || !path || !dirty) return;
    const id = window.setTimeout(() => {
      void handleSave();
    }, 2000);
    return () => window.clearTimeout(id);
  }, [autosave, path, dirty, content, handleSave]);

  const handleInsertLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien :", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleInsertImage = async () => {
    if (!editor) return;

    let mdPath = path;
    if (!mdPath) {
      const selected = await pickSaveMarkdown("document.md");
      if (!selected) {
        window.alert(
          "Enregistrez d'abord le document pour pouvoir lier une image.",
        );
        return;
      }
      mdPath = selected.toLowerCase().endsWith(".md")
        ? selected
        : `${selected}.md`;
      await saveTo(mdPath);
    }

    const imagePath = await pickImageFile();
    if (!imagePath) return;

    try {
      const rel = await importImage(mdPath, imagePath);
      const alt = window.prompt("Texte alternatif :", "") ?? "";
      editor.chain().focus().setImage({ src: rel, alt }).run();
      setDirty(true);
    } catch (err) {
      window.alert(`Impossible d'importer l'image : ${String(err)}`);
    }
  };

  const handleFind = useCallback(() => {
    if (!editor) return;
    const query = window.prompt("Rechercher :");
    if (!query) return;
    const { doc } = editor.state;
    let found = false;
    doc.descendants((node, pos) => {
      if (found || !node.isText || !node.text) return;
      const index = node.text.toLowerCase().indexOf(query.toLowerCase());
      if (index >= 0) {
        editor
          .chain()
          .focus()
          .setTextSelection({
            from: pos + index,
            to: pos + index + query.length,
          })
          .scrollIntoView()
          .run();
        found = true;
      }
    });
    if (!found) window.alert("Aucun résultat.");
  }, [editor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        if (e.shiftKey) void handleSaveAs();
        else void handleSave();
      } else if (key === "o") {
        e.preventDefault();
        void handleOpen();
      } else if (key === "n") {
        e.preventDefault();
        handleNew();
      } else if (key === "f") {
        e.preventDefault();
        handleFind();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave, handleSaveAs, handleOpen, handleNew, handleFind]);

  const docTitle = `${basename(path)}${dirty ? " *" : ""} - Mord`;

  return (
    <div className="mord-app">
      <TitleBar
        title={docTitle}
        autosave={autosave}
        onAutosaveChange={setAutosave}
        onSave={() => void handleSave()}
        canUndo={!!editor?.can().undo()}
        onUndo={() => editor?.chain().focus().undo().run()}
      />

      <Ribbon
        tab={tab}
        onTabChange={setTab}
        editor={editor}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        outlineVisible={outlineVisible}
        onToggleOutline={() => setOutlineVisible((v) => !v)}
        onNew={handleNew}
        onOpen={() => void handleOpen()}
        onSave={() => void handleSave()}
        onSaveAs={() => void handleSaveAs()}
        onInsertLink={handleInsertLink}
        onInsertImage={() => void handleInsertImage()}
        onFind={handleFind}
      />

      <div className="mord-workspace">
        <OutlinePanel editor={editor} visible={outlineVisible} />
        <div className="mord-editor-shell">
          <Rulers />
          <main
            className="mord-page"
            ref={pageRef}
            style={{ zoom: zoom / 100 }}
          >
            <LineSelectZone
              editor={editor}
              pageRef={pageRef}
              onSelectionUpdate={() => setTick((t) => t + 1)}
            />
            <MarkdownEditor
              ref={editorRef}
              initialContent={loadedContent}
              onReady={handleEditorReady}
              onUpdate={markDirty}
              onSelectionUpdate={() => setTick((t) => t + 1)}
            />
          </main>
        </div>
      </div>

      <StatusBar
        path={path}
        dirty={dirty}
        wordCount={countWords(content)}
        zoom={zoom}
        onZoomChange={setZoom}
      />
      <span hidden>{tick}</span>
    </div>
  );
}
