import { useFixtureStore } from "../stores/FixtureStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { FixtureIcon } from "../components/common/FixtureIcon";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";

export function FixturesPage() {
  const { rows: fixtures } = useIndexedDbStore(useFixtureStore());
  const { conflicts, hasConflict } = useDmxAddressCheck(fixtures);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>灯具布置</h1>
        </div>
        <StatusBadge value={hasConflict ? "CONFLICT" : "READY"} label={hasConflict ? "DMX 冲突" : "DMX 正常"} />
      </section>

      <section className="metrics">
        <StatCard label="灯具数量" value={fixtures.length} />
        <StatCard label="DMX 冲突" value={conflicts.length} />
        <StatCard label="通道合计" value={fixtures.reduce((sum, f) => sum + (Number(f.channel_count) || 0), 0)} />
      </section>

      <section className="panel wide">
        <h2>灯具清单</h2>
        <div className="table">
          {fixtures.map((f) => (
            <article key={f.id} className="row">
              <strong>
              <FixtureIcon type={f.fixture_type} /> {f.fixture_code}
              </strong>
              <span>DMX {f.dmx_address} · {f.channel_count} 通道 · {f.color_mode}</span>
              <StatusBadge value={f.fixture_type} />
            </article>
          ))}
        </div>
        {conflicts.map((c) => (
          <p key={c} className="error-text">{c}</p>
        ))}
      </section>
    </main>
  );
}
