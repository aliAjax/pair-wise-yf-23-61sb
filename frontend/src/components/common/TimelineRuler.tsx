import { formatMs } from "../../utils/formatters";

export function TimelineRuler({ totalMs, tickMs = 5000 }: { totalMs: number; tickMs?: number }) {
  const safeTotal = Math.max(totalMs, tickMs);
  const ticks: number[] = [];
  for (let t = 0; t <= safeTotal; t += tickMs) ticks.push(t);
  return (
    <div className="ruler">
      {ticks.map((t) => (
        <span key={t} className="tick" style={{ left: `${(t / safeTotal) * 100}%` }}>
          {formatMs(t)}
        </span>
      ))}
    </div>
  );
}
