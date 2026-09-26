import { useMemo } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { TrackPlayStateText } from "../constants/TrackPlayState";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { formatMs, formatPriority } from "../utils/formatters";
import { resolveTimeline } from "../utils/trackResolver";

export function PreviewPage() {
  const scenes = useCueSceneStore((s) => s.rows);
  const tracks = useTimelineTrackStore((s) => s.rows);
  const fixtures = useFixtureStore((s) => s.rows);

  const resolved = useMemo(() => resolveTimeline(tracks, scenes), [tracks, scenes]);
  const { segments, totalMs, nowMs, playing, activeNow, play, pause, stop, seek } =
    useTimelinePlayback(resolved);

  const excluded = resolved.filter((r) => r.state !== "ACTIVE");
  const lit = activeNow.length > 0;

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">preview</p>
          <h1>舞台预览</h1>
        </div>
        <div className="cue-actions">
          {playing ? (
            <button className="btn" type="button" onClick={pause}>暂停</button>
          ) : (
            <button className="btn primary" type="button" onClick={play} disabled={totalMs === 0}>播放</button>
          )}
          <button className="btn ghost" type="button" onClick={stop}>停止</button>
        </div>
      </section>

      <section className="panel">
        <h2>舞台</h2>
        <div className={"stage" + (lit ? " lit" : "")}>
          {fixtures.map((fixture) => (
            <span
              key={fixture.id}
              className={"fixture-dot" + (lit ? " on" : "")}
              style={{ left: `${Number(fixture.position_x) || 0}px`, top: `${Number(fixture.position_y) || 0}px` }}
              title={fixture.fixture_code}
            >
              {fixture.fixture_code}
            </span>
          ))}
        </div>
        <div className="playback">
          <input
            type="range"
            min={0}
            max={totalMs || 1}
            step={100}
            value={nowMs}
            onChange={(e) => seek(Number(e.target.value))}
          />
          <p className="hint">
            {formatMs(nowMs)} / {formatMs(totalMs)}
            {activeNow.length > 0
              ? ` · 正在播放：${activeNow.map((item) => `${item.scene?.name}（${formatPriority(item.scene?.priority ?? 0)}）`).join("、")}`
              : " · 当前无播放中的场景"}
          </p>
        </div>
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>播放序列（仅有效轨道）</h2>
          {segments.length === 0 ? <EmptyState title="没有可播放的轨道" /> : (
            <div className="timeline">
              <TimelineRuler totalMs={Math.max(totalMs, 5000)} />
              <div className="layer-lane playback-lane">
                {segments.map((item) => (
                  <span
                    key={item.track.id}
                    className="track-block state-active"
                    style={{
                      left: `${(item.track.start_ms / Math.max(totalMs, 1)) * 100}%`,
                      width: `${Math.max(4, (item.track.duration_ms / Math.max(totalMs, 1)) * 100)}%`
                    }}
                  >
                    <span className="track-name">{item.scene?.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="panel">
          <h2>不参与播放（{excluded.length}）</h2>
          {excluded.length === 0 ? <p className="hint">全部轨道均有效。</p> : (
            <ul className="excluded-list">
              {excluded.map((item) => (
                <li key={item.track.id}>
                  <span>{item.scene?.name ?? `场景 #${item.track.cue_scene_id} 缺失`}</span>
                  <StatusBadge
                    value={TrackPlayStateText[item.state]}
                    tone={item.state === "INVALID" ? "bad" : "warn"}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
