type Tone = "ok" | "warn" | "bad" | "muted";

export function StatusBadge({ value, tone }: { value: string; tone?: Tone }) {
  const cls = "badge" + (tone ? ` tone-${tone}` : "");
  return <span className={cls}>{value}</span>;
}
