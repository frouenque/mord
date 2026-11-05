/**
 * Règles calées sur une page A4 portrait (210 × 297 mm).
 * Graduations en centimètres.
 */
const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;

export function Rulers() {
  const hMarks = Array.from({ length: A4_WIDTH_CM + 1 }, (_, i) => i);
  const vMarks = Array.from({ length: Math.floor(A4_HEIGHT_CM) + 1 }, (_, i) => i);

  return (
    <>
      <div className="mord-ruler-corner" aria-hidden />
      <div className="mord-ruler-h" aria-hidden>
        <div className="mord-ruler-h-track">
          {hMarks.map((n) => (
            <div
              key={n}
              className={`mord-ruler-h-mark${n % 5 === 0 ? " is-major" : ""}`}
              style={{ left: `${(n / A4_WIDTH_CM) * 100}%` }}
            >
              {n % 5 === 0 ? <span>{n}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <div className="mord-ruler-v" aria-hidden>
        <div className="mord-ruler-v-track">
          {vMarks.map((n) => (
            <div
              key={n}
              className={`mord-ruler-v-mark${n % 5 === 0 ? " is-major" : ""}`}
              style={{ top: `${(n / A4_HEIGHT_CM) * 100}%` }}
            >
              {n % 5 === 0 ? <span>{n}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
