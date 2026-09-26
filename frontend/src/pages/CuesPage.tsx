import { useState } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { createCueSceneForm } from "../constructors/CueSceneConstructor";
import { CueStatus, CueStatusZh } from "../constants/CueStatus";
import { TrackStatusText } from "../constants/TrackStatus";
import { CueCard } from "../components/common/CueCard";
import { StatCard } from "../components/common/StatCard";
import type { CueScene } from "../types/CueScene";

export function CuesPage() {
  const { rows: scenes, loading } = useIndexedDbStore(useCueSceneStore());
  const { rows: tracks } = useIndexedDbStore(useTimelineTrackStore());
  const error = useCueSceneStore((s) => s.error);
  const save = useCueSceneStore((s) => s.save);
  const [form, setForm] = useState<CueScene | null>(null);
  const [savedTip, setSavedTip] = useState("");

  const trackStatusOf = (sceneId: number) => {
    const statuses = tracks.filter((t) => t.cue_scene_id === sceneId).map((t) => t.track_status);
    if (!statuses.length) return "";
    if (statuses.includes("INVALID")) return TrackStatusText.INVALID;
    if (statuses.includes("REPLACED")) return TrackStatusText.REPLACED;
    return "";
  };

  const startCreate = () => {
    const id = Math.max(0, ...scenes.map((s) => s.id)) + 1;
    setForm(createCueSceneForm({ id }));
    setSavedTip("");
  };

  const submit = async () => {
    if (!form) return;
    const ok = await save(form);
    if (ok) setSavedTip(`已保存「${form.name}」，并同步到时间轴`);
  };

  const patch = (patch: Partial<CueScene>) => setForm((f) => (f ? { ...f, ...patch } : f));

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light / 联排</p>
          <h1>场景编辑</h1>
        </div>
        <button type="button" className="primary" onClick={startCreate}>新建场景</button>
      </section>

      <section className="metrics">
        <StatCard label="场景总数" value={scenes.length} />
        <StatCard label="停用" value={scenes.filter((s) => s.scene_status === "DISABLED").length} />
        <StatCard label="归档" value={scenes.filter((s) => s.scene_status === "ARCHIVED").length} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>场景列表{loading ? "（加载中…）" : ""}</h2>
          <div className="cue-list">
            {scenes.map((scene) => (
              <CueCard
                key={scene.id}
                scene={scene}
                selected={form?.id === scene.id}
                cornerBadge={trackStatusOf(scene.id)}
                onClick={() => { setForm({ ...scene }); setSavedTip(""); }}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>场景属性</h2>
          {form ? (
            <div className="form-grid">
              <label>
                场景名称
                <input value={form.name} onChange={(e) => patch({ name: e.target.value })} />
              </label>
              <label>
                淡入（毫秒）
                <input type="number" min="0" value={form.fade_in_ms} onChange={(e) => patch({ fade_in_ms: e.target.value })} />
              </label>
              <label>
                保持（毫秒）
                <input type="number" min="0" value={form.hold_ms} onChange={(e) => patch({ hold_ms: e.target.value })} />
              </label>
              <label>
                优先级（数值越大越高）
                <input type="number" min="0" value={form.priority} onChange={(e) => patch({ priority: e.target.value })} />
              </label>
              <label>
                状态
                <select value={form.scene_status} onChange={(e) => patch({ scene_status: e.target.value })}>
                  {CueStatus.map((s) => (
                    <option key={s} value={s}>{CueStatusZh[s]}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="primary" onClick={submit}>保存并同步时间轴</button>
              {error ? <p className="error-text">{error}</p> : null}
              {savedTip ? <p className="ok-text">{savedTip}</p> : null}
              <p className="hint">保存后立即排入时间轴；停用或归档的场景，其已排轨道会标记为“失效”并退出播放。</p>
            </div>
          ) : (
            <p className="hint">从左侧选择一个场景，或点击“新建场景”。</p>
          )}
        </div>
      </section>
    </main>
  );
}
