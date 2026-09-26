import { create } from "zustand";
import { listCueScene, saveCueScene } from "../api/CueScene";
import {deleteTimelineTrack, listTimelineTrack, saveTimelineTrack} from "../api/TimelineTrack";
import { applyTrackStatuses } from "../utils/trackStatusResolver";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  ensureTrackForScene: (scene: CueScene) => Promise<void>;
  updateTrack: (id: number, patch: Partial<TimelineTrack>) => Promise<void>;
  removeTrack: (id: number) => Promise<void>;
  syncStatuses: () => Promise<void>;
};

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,

  async load() {
    set({ loading: true });
    const [tracks, scenes] = await Promise.all([listTimelineTrack(), listCueScene()]);
    const { rows, changed } = applyTrackStatuses(tracks, scenes);
    if (changed.length) await Promise.all(changed.map((row) => saveTimelineTrack(row)));
    set({ rows, loading: false });
  },

  // 场景保存后调用：没有轨道的场景自动排到队尾，已有轨道跟随场景的淡入+保持时长。
  // 直接读写 IndexedDB 最新数据，避免 store 尚未加载时算出冲突的 id/位置。
  async ensureTrackForScene(scene) {
    const tracks = await listTimelineTrack();
    const duration = String(Math.max(1000, Number(scene.fade_in_ms) + Number(scene.hold_ms)));
    const existing = tracks.filter((t) => t.cue_scene_id === scene.id);
    if (existing.length) {
      const updates = existing.filter((t) => t.locked !== "true" && t.duration_ms !== duration);
      for (const t of updates) await saveTimelineTrack({ ...t, duration_ms: duration });
    } else {
      const id = Math.max(0, ...tracks.map((t) => t.id)) + 1;
      const start = Math.max(0, ...tracks.map((t) => Number(t.start_ms) + Number(t.duration_ms)));
      await saveTimelineTrack({
        id,
        cue_scene_id: scene.id,
        start_ms: String(start),
        duration_ms: duration,
        layer: "1",
        locked: "false",
        track_status: "ACTIVE"
      });
      console.info(LOG_TEMPLATES.CueScene[4], scene.name);
    }
    set({ rows: await listTimelineTrack() });
  },

  async updateTrack(id, patch) {
    const track = get().rows.find((t) => t.id === id);
    if (!track) return;
    const unlocking = patch.locked !== undefined && patch.locked !== track.locked;
    if (track.locked === "true" && !unlocking) {
      set({ error: ERROR_MESSAGES.TRACK_LOCKED });
      return;
    }
    const next = { ...track, ...patch };
    await saveTimelineTrack(next);
    set({ rows: get().rows.map((t) => (t.id === id ? next : t)), error: null });
    console.info(LOG_TEMPLATES.TimelineTrack[1], id);
    await get().syncStatuses();
  },

  async removeTrack(id) {
    const track = get().rows.find((t) => t.id === id);
    if (!track) return;
    if (track.locked === "true") {
      set({ error: ERROR_MESSAGES.TRACK_LOCKED });
      return;
    }
    await deleteTimelineTrack(id);
    set({ rows: get().rows.filter((t) => t.id !== id), error: null });
    console.info(LOG_TEMPLATES.TimelineTrack[4], id);
    await get().syncStatuses();
  },

  async syncStatuses() {
    const scenes = await listCueScene();
    const { rows, changed } = applyTrackStatuses(get().rows, scenes);
    if (!changed.length) return;
    set({ rows });
    await Promise.all(changed.map((row) => saveTimelineTrack(row)));
    console.info(LOG_TEMPLATES.TimelineTrack[5], changed.map((t) => t.id));
  }
}));
