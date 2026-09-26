import { useMemo, useState } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { TrackStatusText } from "../constants/TrackStatus";
import { CueStatusZh } from "../constants/CueStatus";
import { formatLayer, formatMs, parseMs } from "../utils/formatters";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import type { TimelineTrack } from "../types/TimelineTrack";

const PX_PER_MS = 0.06;
const NUDGE_MS = 500;

export function TimelinePage() {
  const { rows: tracks } = useIndexedDbStore(useTimelineTrackStore());
  const { rows: scenes } = useIndexedDbStore(useCueSceneStore());
  const error = useTimelineTrackStore((s) => s.error);
  const updateTrack = useTimelineTrackStore((s) => s.updateTrack);
  const removeTrack = useTimelineTrackStore((s) => s.removeTrack);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const sceneById = useMemo(() => new Map(scenes.map((s) => [s.id, s])), [scenes]);
  const layers = useMemo(
    () => [...new Set(tracks.map((t) => t.layer))].sort((a, b) => Number(a) - Number(b)),
    [tracks]
  );
  const totalMs = useMemo(
    () => Math.max(1000, ...tracks.map((t) => parseMs(t.start_ms) + parseMs(t.duration_ms))) + 1000,
    [tracks]
  );
  const countOf = (status: string) => tracks.filter((t) => t.track_status === status).length;
  const selected = tracks.find((t) => t.id === selectedId) ?? null;
  const selectedScene = selected ? sceneById.get(selected.cue_scene_id) : undefined;

  const nudge = (track: TimelineTrack, delta: number) =>
    updateTrack(track.id, { start_ms: String(Math.max(0, parseMs(track.start_ms) + delta)) });

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light / 联排</p>
          <h1>时间轴编排</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" label="本地 IndexedDB" />
      </section>

      <section className="metrics">
        <StatCard label="轨道总数" value={tracks.length} />
        <StatCard label="有效" value={countOf("ACTIVE")} />
        <StatCard label="被替换" value={countOf("REPLACED")} />
        <StatCard label="失效" value={countOf("INVALID")} />
      </section>

      <section className="panel wide">
        <h2>排布（点击轨道块进行调整）</h2>
        <div className="timeline-scroll">
          <TimelineRuler totalMs={totalMs} pxPerMs={PX_PER_MS} />
          {layers.map((layer) => (
            <div key={layer} className="layer-row">
              <span className="layer-label">{formatLayer(layer)}</span>
              <div className="layer-lane" style={{ width: totalMs * PX_PER_MS }}>
                {tracks
                  .filter((t) => t.layer === layer)
                  .map((t) => {
                    const scene = sceneById.get(t.cue_scene_id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        className={`track-block ${t.track_status.toLowerCase()}${t.id === selectedId ? " selected" : ""}`}
                        style={{ left: parseMs(t.start_ms) * PX_PER_MS, width: parseMs(t.duration_ms) * PX_PER_MS }}
                        onClick={() => setSelectedId(t.id)}
                        title={`${scene?.name ?? "未知场景"} · ${formatMs(t.start_ms)} 起`}
                      >
                        <span className="track-name">
                          {t.locked === "true" ? "🔒 " : ""}
                          {scene?.name ?? `场景 ${t.cue_scene_id}`}
                        </span>
                        {t.track_status !== "ACTIVE" ? (
                          <span className="track-flag">{TrackStatusText[t.track_status as keyof typeof TrackStatusText]}</span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        <p className="hint">
          规则：同层时间重叠时保留优先级较高的场景，较低的一条标为“被替换”并留在原位；移除高优先级轨道后，原场景自动恢复。场景停用或归档后，对应轨道标为“失效”并退出播放。
        </p>
      </section>

      <section className="panel wide">
        <h2>轨道调整</h2>
        {selected ? (
          <div className="track-editor">
            <p>
              <strong>{selectedScene?.name ?? "未知场景"}</strong>
              <StatusBadge
                value={selected.track_status}
                label={TrackStatusText[selected.track_status as keyof typeof TrackStatusText] ?? selected.track_status}
              />
              {selectedScene ? <StatusBadge value={selectedScene.scene_status} label={CueStatusZh[selectedScene.scene_status as keyof typeof CueStatusZh]} /> : null}
            </p>
            <p className="hint">
              开始 {formatMs(selected.start_ms)} · 时长 {formatMs(selected.duration_ms)} · {formatLayer(selected.layer)} · 优先级 {selectedScene?.priority ?? "-"}
            </p>
            <div className="toolbar">
              <button type="button" onClick={() => nudge(selected, -NUDGE_MS)}>◀ 0.5s</button>
              <button type="button" onClick={() => nudge(selected, NUDGE_MS)}>▶ 0.5s</button>
              <label>
                层
                <select value={selected.layer} onChange={(e) => updateTrack(selected.id, { layer: e.target.value })}>
                  {["1", "2", "3", "4"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={() => updateTrack(selected.id, { locked: selected.locked === "true" ? "false" : "true" })}>
                {selected.locked === "true" ? "解锁" : "锁定"}
              </button>
              <button type="button" className="danger" onClick={() => { void removeTrack(selected.id); setSelectedId(null); }}>
                移除（撤销排程）
              </button>
            </div>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
        ) : (
          <p className="hint">点击上方轨道块进行调整：左右平移、换层、锁定或移除。</p>
        )}
      </section>
    </main>
  );
}
