/** Règles horizontale + verticale façon Word (repères visuels). */
export function Rulers() {
  const hMarks = Array.from({ length: 17 }, (_, i) => i);
  const vMarks = Array.from({ length: 22 }, (_, i) => i);

  return (
    <>
      <div className="mord-ruler-corner" aria-hidden />
      <div className="mord-ruler-h" aria-hidden>
        <div className="mord-ruler-h-track">
          {hMarks.map((n) => (
            <div key={n} className="mord-ruler-h-mark" style={{ left: `${(n / 16) * 100}%` }}>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mord-ruler-v" aria-hidden>
        <div className="mord-ruler-v-track">
          {vMarks.map((n) => (
            <div key={n} className="mord-ruler-v-mark" style={{ top: `${(n / 21) * 100}%` }}>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
