import { useMemo, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { CueStatusText } from "../constants/CueStatus";
import { TrackPlayStateText } from "../constants/TrackPlayState";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { formatMs, formatPriority } from "../utils/formatters";
import { resolveTimeline, type ResolvedTrack } from "../utils/trackResolver";
import type { PageProps } from "../router/routes";

const STATE_TONE = { ACTIVE: "ok", INVALID: "bad", REPLACED: "warn" } as const;

export function TimelinePage({ onNavigate }: PageProps) {
  const scenes = useCueSceneStore((s) => s.rows);
  const { rows: tracks, updateTrack, removeTrack, toggleLock } = useTimelineTrackStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolved = useMemo(() => resolveTimeline(tracks, scenes), [tracks, scenes]);
  const totalMs = useMemo(
    () => Math.max(30000, ...resolved.map((r) => r.track.start_ms + r.track.duration_ms + 2000)),
    [resolved]
  );
  const layers = useMemo(
    () => [...new Set(resolved.map((r) => r.track.layer))].sort((a, b) => a - b),
    [resolved]
  );
  const selected = resolved.find((r) => r.track.id === selectedId) ?? null;
  const byId = useMemo(() => new Map(resolved.map((r) => [r.track.id, r])), [resolved]);

  const counts = useMemo(
    () => ({
      active: resolved.filter((r) => r.state === "ACTIVE").length,
      replaced: resolved.filter((r) => r.state === "REPLACED").length,
      invalid: resolved.filter((r) => r.state === "INVALID").length
    }),
    [resolved]
  );

  const guardLocked = (item: ResolvedTrack, fn: () => Promise<void>) => {
    if (item.track.locked) {
      setError(ERROR_MESSAGES.TRACK_LOCKED);
      return;
    }
    setError(null);
    void fn();
  };

  const moveSelected = (patch: Partial<{ start_ms: number; layer: number }>) => {
    if (!selected) return;
    guardLocked(selected, () => updateTrack({ ...selected.track, ...patch }));
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">timeline</p>
          <h1>时间轴编排</h1>
        </div>
        <button className="btn" type="button" onClick={() => onNavigate?.("/cues")}>返回场景编辑</button>
      </section>

      <section className="metrics">
        <StatCard label="轨道总数" value={resolved.length} />
        <StatCard label="参与播放" value={counts.active} />
        <StatCard label="被替换 / 失效" value={`${counts.replaced} / ${counts.invalid}`} />
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="workbench">
        <div className="panel wide">
          <h2>轨道排布</h2>
          {resolved.length === 0 ? (
            <EmptyState title="时间轴为空，去场景页新建场景" />
          ) : (
            <div className="timeline">
              <TimelineRuler totalMs={totalMs} />
              {layers.map((layer) => (
                <div key={layer} className="layer-row">
                  <span className="layer-label">层 {layer}</span>
                  <div className="layer-lane">
                    {resolved
                      .filter((r) => r.track.layer === layer)
                      .map((item) => {
                        const left = (item.track.start_ms / totalMs) * 100;
                        const width = Math.max(4, (item.track.duration_ms / totalMs) * 100);
                        return (
                          <button
                            key={item.track.id}
                            type="button"
                            className={
                              "track-block state-" + item.state.toLowerCase() +
                              (item.track.id === selectedId ? " selected" : "")
                            }
                            style={{ left: `${left}%`, width: `${width}%` }}
                            onClick={() => { setSelectedId(item.track.id); setError(null); }}
                            title={`${item.scene?.name ?? "场景缺失"} · ${formatMs(item.track.start_ms)} 起`}
                          >
                            <span className="track-name">
                              {item.track.locked && "🔒 "}
                              {item.scene?.name ?? `场景 #${item.track.cue_scene_id} 缺失`}
                            </span>
                            <span className="track-flags">
                              {item.scene && <em>{formatPriority(item.scene.priority)}</em>}
                              {item.state !== "ACTIVE" && <em>{TrackPlayStateText[item.state]}</em>}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
              <p className="legend">
                <StatusBadge value="正常" tone="ok" /> 参与播放
                <StatusBadge value="被替换" tone="warn" /> 同层被更高优先级覆盖，留在原位
                <StatusBadge value="失效" tone="bad" /> 场景停用/归档，不参与播放
              </p>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>轨道详情</h2>
          {!selected ? (
            <p className="hint">点击左侧轨道块查看详情。移除高优先级轨道后，被替换的轨道会自动恢复。</p>
          ) : (
            <div className="track-detail">
              <p>
                <strong>{selected.scene?.name ?? "场景缺失"}</strong>{" "}
                <StatusBadge value={TrackPlayStateText[selected.state]} tone={STATE_TONE[selected.state]} />
              </p>
              {selected.scene && (
                <p className="hint">
                  场景状态：{CueStatusText[selected.scene.scene_status]} · 优先级 {formatPriority(selected.scene.priority)} ·
                  淡入 {formatMs(selected.scene.fade_in_ms)} · 保持 {formatMs(selected.scene.hold_ms)}
                </p>
              )}
              {selected.state === "REPLACED" && selected.replacedBy !== undefined && (
                <p className="hint">
                  被「{byId.get(selected.replacedBy)?.scene?.name ?? `轨道 #${selected.replacedBy}`}」替换；
                  移除该轨道或将其场景停用后，本轨道恢复播放。
                </p>
              )}
              {selected.state === "INVALID" && (
                <p className="hint">场景已停用或归档，本轨道不参与播放；恢复场景后重新生效。</p>
              )}
              <div className="form-grid">
                <label>
                  开始时间（毫秒）
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={selected.track.start_ms}
                    disabled={selected.track.locked}
                    onChange={(e) => moveSelected({ start_ms: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </label>
                <label>
                  所在层
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={selected.track.layer}
                    disabled={selected.track.locked}
                    onChange={(e) => moveSelected({ layer: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                  />
                </label>
              </div>
              <p className="hint">
                时长 {formatMs(selected.track.duration_ms)} · {formatMs(selected.track.start_ms)} - {formatMs(selected.track.start_ms + selected.track.duration_ms)}
              </p>
              <div className="cue-actions">
                <button className="btn ghost" type="button" onClick={() => toggleLock(selected.track.id)}>
                  {selected.track.locked ? "解锁轨道" : "锁定轨道"}
                </button>
                <button
                  className="btn danger"
                  type="button"
                  disabled={selected.track.locked}
                  onClick={() => guardLocked(selected, async () => { await removeTrack(selected.track.id); setSelectedId(null); })}
                >
                  移除轨道
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
