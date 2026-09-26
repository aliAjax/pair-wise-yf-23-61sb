export function TimelineRuler({
  totalMs,
  pxPerMs,
  currentMs
}: {
  totalMs: number;
  pxPerMs: number;
  currentMs?: number;
}) {
  const seconds = Math.max(1, Math.ceil(totalMs / 1000));
  return (
    <div className="timeline-ruler" style={{ width: totalMs * pxPerMs }}>
      {Array.from({ length: seconds + 1 }, (_, s) => (
        <span key={s} className="tick" style={{ left: s * 1000 * pxPerMs }}>
          {s}s
        </span>
      ))}
      {currentMs !== undefined ? <span className="playhead" style={{ left: currentMs * pxPerMs }} /> : null}
    </div>
  );
}
