import { create } from "zustand";
import { listCueScene, persistCueScene } from "../api/CueScene";
import { createDefaultCueScene } from "../constructors/CueSceneConstructor";
import { logAction } from "../utils/logger";
import { useTimelineTrackStore } from "./TimelineTrackStore";
import type { CueScene } from "../types/CueScene";
import type { CueStatus } from "../types/CueStatus";

type State = {
  rows: CueScene[];
  loading: boolean;
  load: () => Promise<void>;
  /** 新建或更新场景；新建时自动排入时间轴，保存后立即在时间轴可见。 */
  saveScene: (scene: CueScene) => Promise<CueScene>;
  setSceneStatus: (id: number, status: CueStatus) => Promise<void>;
};

const nextId = (rows: { id: number }[]) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listCueScene(), loading: false });
  },
  async saveScene(scene) {
    const rows = get().rows;
    const existing = rows.find((row) => row.id === scene.id);
    const saved = existing ? { ...existing, ...scene } : createDefaultCueScene({ ...scene, id: nextId(rows) });
    const next = existing ? rows.map((row) => (row.id === saved.id ? saved : row)) : [...rows, saved];
    set({ rows: next });
    await persistCueScene(next);
    logAction("CueScene", existing ? "update" : "create", saved);
    if (!existing) {
      await useTimelineTrackStore.getState().addTrackForScene(saved.id, {
        duration_ms: Math.max(1000, saved.fade_in_ms + saved.hold_ms)
      });
    }
    return saved;
  },
  async setSceneStatus(id, status) {
    const rows = get().rows;
    const target = rows.find((row) => row.id === id);
    if (!target || target.scene_status === status) return;
    const next = rows.map((row) => (row.id === id ? { ...row, scene_status: status } : row));
    set({ rows: next });
    await persistCueScene(next);
    const action =
      status === "DISABLED" ? "disable" : status === "ARCHIVED" ? "archive" : "restore";
    logAction("CueScene", action, { id, from: target.scene_status, to: status });
  }
}));
