import { useMemo, useState } from "react";
import { CueCard } from "../components/common/CueCard";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { CueStatusText } from "../constants/CueStatus";
import { createCueSceneForm } from "../constructors/CueSceneConstructor";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { formatMs, formatPriority } from "../utils/formatters";
import type { CueScene } from "../types/CueScene";
import type { PageProps } from "../router/routes";

type FormState = {
  id: number;
  name: string;
  fade_in_ms: string;
  hold_ms: string;
  priority: string;
};

const toForm = (scene: CueScene): FormState => ({
  id: scene.id,
  name: scene.name,
  fade_in_ms: String(scene.fade_in_ms),
  hold_ms: String(scene.hold_ms),
  priority: String(scene.priority)
});

const blankForm = (): FormState => {
  const draft = createCueSceneForm();
  return { id: 0, name: "", fade_in_ms: String(draft.fade_in_ms), hold_ms: String(draft.hold_ms), priority: String(draft.priority) };
};

function validate(form: FormState): string | null {
  const fade = Number(form.fade_in_ms);
  const hold = Number(form.hold_ms);
  const priority = Number(form.priority);
  const ok =
    form.name.trim().length > 0 &&
    Number.isFinite(fade) && fade >= 0 &&
    Number.isFinite(hold) && hold >= 0 &&
    Number.isInteger(priority) && priority >= 0 && priority <= 99;
  return ok ? null : ERROR_MESSAGES.SCENE_FORM_INVALID;
}

export function CuesPage({ onNavigate }: PageProps) {
  const { rows, loading, saveScene, setSceneStatus } = useCueSceneStore();
  const [form, setForm] = useState<FormState>(blankForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const editing = useMemo(() => rows.find((row) => row.id === form.id), [rows, form.id]);
  const sorted = useMemo(() => [...rows].sort((a, b) => b.priority - a.priority || a.id - b.id), [rows]);

  const pick = (scene: CueScene) => {
    setForm(toForm(scene));
    setError(null);
    setNotice(null);
  };

  const save = async () => {
    const message = validate(form);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    const base = editing ?? createCueSceneForm();
    const saved = await saveScene({
      ...base,
      name: form.name.trim(),
      fade_in_ms: Number(form.fade_in_ms),
      hold_ms: Number(form.hold_ms),
      priority: Number(form.priority)
    });
    setForm(toForm(saved));
    setNotice(editing ? `「${saved.name}」已保存，时间轴已同步` : `「${saved.name}」已创建并排入时间轴`);
  };

  const changeStatus = async (scene: CueScene, status: CueScene["scene_status"]) => {
    await setSceneStatus(scene.id, status);
    setNotice(
      status === "DISABLED"
        ? `「${scene.name}」已停用，相关轨道标记为失效`
        : status === "ARCHIVED"
          ? `「${scene.name}」已归档，相关轨道标记为失效`
          : `「${scene.name}」已恢复，相关轨道重新生效`
    );
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">cues</p>
          <h1>场景编辑</h1>
        </div>
        <button className="btn" type="button" onClick={() => { setForm(blankForm()); setError(null); setNotice(null); }}>
          新建场景
        </button>
      </section>

      {notice && (
        <p className="notice">
          {notice}
          <button className="btn ghost" type="button" onClick={() => onNavigate?.("/timeline")}>前往时间轴</button>
        </p>
      )}

      <section className="workbench">
        <div className="panel wide">
          <h2>场景列表（{loading ? "加载中" : `${sorted.length} 个`}）</h2>
          {sorted.length === 0 ? <EmptyState title="暂无场景，先新建一个" /> : (
            <div className="cue-list">
              {sorted.map((scene) => (
                <div key={scene.id} className="cue-item">
                  <CueCard scene={scene} selected={scene.id === form.id} onSelect={pick} />
                  <div className="cue-actions">
                    {scene.scene_status !== "DISABLED" && scene.scene_status !== "ARCHIVED" && (
                      <>
                        <button className="btn ghost" type="button" onClick={() => changeStatus(scene, "DISABLED")}>停用</button>
                        <button className="btn ghost" type="button" onClick={() => changeStatus(scene, "ARCHIVED")}>归档</button>
                      </>
                    )}
                    {scene.scene_status === "DISABLED" && (
                      <>
                        <button className="btn ghost" type="button" onClick={() => changeStatus(scene, "READY")}>恢复</button>
                        <button className="btn ghost" type="button" onClick={() => changeStatus(scene, "ARCHIVED")}>归档</button>
                      </>
                    )}
                    {scene.scene_status === "ARCHIVED" && (
                      <button className="btn ghost" type="button" onClick={() => changeStatus(scene, "READY")}>恢复</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>{editing ? `编辑：${editing.name}` : "新建场景"}</h2>
          {editing && (
            <p className="form-status">
              当前状态 <StatusBadge value={CueStatusText[editing.scene_status]} />
            </p>
          )}
          <div className="form-grid">
            <label>
              场景名称
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：独白追光" />
            </label>
            <label>
              淡入（毫秒）
              <input type="number" min={0} step={100} value={form.fade_in_ms} onChange={(e) => setForm({ ...form, fade_in_ms: e.target.value })} />
            </label>
            <label>
              保持（毫秒）
              <input type="number" min={0} step={100} value={form.hold_ms} onChange={(e) => setForm({ ...form, hold_ms: e.target.value })} />
            </label>
            <label>
              优先级（0-99，越大越优先）
              <input type="number" min={0} max={99} step={1} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
            </label>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn primary" type="button" onClick={save}>保存场景</button>
          {editing && (
            <p className="hint">
              保存后时间轴立即更新：淡入 {formatMs(Number(form.fade_in_ms) || 0)}、保持 {formatMs(Number(form.hold_ms) || 0)}、优先级 {formatPriority(Number(form.priority) || 0)}。
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
