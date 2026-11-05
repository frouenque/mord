interface Props {
  path: string | null;
  dirty: boolean;
  wordCount: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function StatusBar({
  path,
  dirty,
  wordCount,
  zoom,
  onZoomChange,
}: Props) {
  return (
    <footer className="mord-statusbar">
      <div className="mord-statusbar-left">
        <span title={path ?? undefined}>
          {path ? path.replace(/\\/g, "/").split("/").pop() : "Sans titre"}
          {dirty ? " *" : ""}
        </span>
        <span className="mord-status-sep" />
        <span>
          {wordCount} mot{wordCount === 1 ? "" : "s"}
        </span>
        <span className="mord-status-sep" />
        <span>Français (France)</span>
      </div>

      <div className="mord-statusbar-right">
        <span className="mord-view-mode is-active" title="Mode page">
          📄
        </span>
        <span className="mord-view-mode" title="Mode web">
          🗔
        </span>
        <button
          type="button"
          className="mord-zoom-btn"
          onClick={() => onZoomChange(Math.max(50, zoom - 10))}
          title="Zoom −"
        >
          −
        </button>
        <input
          className="mord-zoom-slider"
          type="range"
          min={50}
          max={200}
          step={10}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          title={`Zoom ${zoom}%`}
        />
        <button
          type="button"
          className="mord-zoom-btn"
          onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          title="Zoom +"
        >
          +
        </button>
        <span className="mord-zoom-label">{zoom}%</span>
      </div>
    </footer>
  );
}
