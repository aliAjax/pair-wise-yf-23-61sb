const ICONS: Record<string, string> = {
  PAR: "◉",
  SPOT: "◎",
  WASH: "◍",
  BEAM: "◈",
  STROBE: "✦"
};

export function FixtureIcon({ type }: { type: string }) {
  return <span className="fixture-icon" title={type}>{ICONS[type] ?? "◌"}</span>;
}
