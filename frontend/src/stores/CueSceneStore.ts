import { create } from "zustand";
import { listCueScene, saveCueScene } from "../api/CueScene";
import { useTimelineTrackStore } from "./TimelineTrackStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { CueScene } from "../types/CueScene";

type State = {
  rows: CueScene[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  save: (scene: CueScene) => Promise<boolean>;
};

const validate = (scene: CueScene): string | null => {
  if (!scene.name.trim()) return ERROR_MESSAGES.VALIDATION_FAILED;
  for (const key of ["fade_in_ms", "hold_ms", "priority"] as const) {
    const n = Number(scene[key]);
    if (!Number.isFinite(n) || n < 0) return ERROR_MESSAGES.VALIDATION_FAILED;
  }
  return null;
};

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,

  async load() {
    set({ loading: true });
    set({ rows: await listCueScene(), loading: false });
  },

  // 保存场景：落库 -> 自动排入/更新时间轴 -> 重算轨道状态（失效/被替换）。
  async save(scene) {
    const invalid = validate(scene);
    if (invalid) {
      set({ error: invalid });
      return false;
    }
    await saveCueScene(scene);
    const exists = get().rows.some((row) => row.id === scene.id);
    set({
      rows: exists ? get().rows.map((row) => (row.id === scene.id ? scene : row)) : [...get().rows, scene],
      error: null
    });
    console.info(LOG_TEMPLATES.CueScene[exists ? 1 : 0], scene.name);
    const trackStore = useTimelineTrackStore.getState();
    await trackStore.ensureTrackForScene(scene);
    await trackStore.syncStatuses();
    return true;
  }
}));
