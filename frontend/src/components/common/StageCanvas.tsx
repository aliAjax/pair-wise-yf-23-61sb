import type { Fixture } from "../../types/Fixture";

// 640x360 舞台平面，灯具按 position_x/y 落点，颜色来自当前播放场景的 fixture_states。
export function StageCanvas({
  fixtures,
  states
}: {
  fixtures: Fixture[];
  states: Record<string, string>;
}) {
  return (
    <div className="stage-canvas">
      {fixtures.map((f) => {
        const color = states[String(f.id)] ?? "#3a3f45";
        return (
          <span
            key={f.id}
            className="stage-fixture"
            style={{
              left: `${(Number(f.position_x) / 640) * 100}%`,
              top: `${(Number(f.position_y) / 360) * 100}%`,
              background: color,
              boxShadow: `0 0 18px ${color}`
            }}
            title={`${f.fixture_code} · DMX ${f.dmx_address}`}
          >
            {f.fixture_code}
          </span>
        );
      })}
    </div>
  );
}
