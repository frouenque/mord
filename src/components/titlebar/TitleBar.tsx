import { getCurrentWindow } from "@tauri-apps/api/window";

interface Props {
  title: string;
  autosave: boolean;
  onAutosaveChange: (value: boolean) => void;
  onSave: () => void;
  canUndo: boolean;
  onUndo: () => void;
}

export function TitleBar({
  title,
  autosave,
  onAutosaveChange,
  onSave,
  canUndo,
  onUndo,
}: Props) {
  const win = getCurrentWindow();

  return (
    <header className="mord-titlebar">
      <div className="mord-qat">
        <label className="mord-autosave" title="Enregistrement automatique">
          <input
            type="checkbox"
            checked={autosave}
            onChange={(e) => onAutosaveChange(e.target.checked)}
          />
          <span>Enregistrement automatique</span>
        </label>
        <button
          type="button"
          className="mord-qat-btn"
          title="Enregistrer (Ctrl+S)"
          onClick={onSave}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10v4z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="mord-qat-btn"
          title="Annuler"
          disabled={!canUndo}
          onClick={onUndo}
        >
          ↶
        </button>
      </div>

      <div className="mord-titlebar-center" data-tauri-drag-region>
        <span className="mord-brand-mark">M</span>
        <span className="mord-doctitle">{title}</span>
      </div>

      <div className="mord-winbtns">
        <button
          type="button"
          className="mord-winbtn"
          title="Réduire"
          onClick={() => void win.minimize()}
        >
          ─
        </button>
        <button
          type="button"
          className="mord-winbtn"
          title="Agrandir"
          onClick={() => void win.toggleMaximize()}
        >
          □
        </button>
        <button
          type="button"
          className="mord-winbtn is-close"
          title="Fermer"
          onClick={() => void win.close()}
        >
          ×
        </button>
      </div>
    </header>
  );
}
