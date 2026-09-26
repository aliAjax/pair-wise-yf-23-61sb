import { create } from "zustand";
import { listTimelineTrack, persistTimelineTrack } from "../api/TimelineTrack";
import { createDefaultTimelineTrack } from "../constructors/TimelineTrackConstructor";
import { logAction } from "../utils/logger";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  addTrackForScene: (
    sceneId: number,
    opts?: { start_ms?: number; duration_ms?: number; layer?: number }
  ) => Promise<TimelineTrack>;
  updateTrack: (track: TimelineTrack) => Promise<void>;
  /** 移除轨道；被它替换掉的轨道会随状态推导自动恢复。 */
  removeTrack: (id: number) => Promise<void>;
  toggleLock: (id: number) => Promise<void>;
};

const nextId = (rows: { id: number }[]) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listTimelineTrack(), loading: false });
  },
  async addTrackForScene(sceneId, opts = {}) {
    const rows = get().rows;
    const tailEnd = rows.reduce((max, row) => Math.max(max, row.start_ms + row.duration_ms), 0);
    const track = createDefaultTimelineTrack({
      ...opts,
      id: nextId(rows),
      cue_scene_id: sceneId,
      start_ms: opts.start_ms ?? (rows.length === 0 ? 0 : tailEnd + 500)
    });
    const next = [...rows, track];
    set({ rows: next });
    await persistTimelineTrack(next);
    logAction("TimelineTrack", "create", track);
    return track;
  },
  async updateTrack(track) {
    const rows = get().rows;
    if (!rows.some((row) => row.id === track.id)) return;
    const next = rows.map((row) => (row.id === track.id ? { ...track } : row));
    set({ rows: next });
    await persistTimelineTrack(next);
    logAction("TimelineTrack", "update", track);
  },
  async removeTrack(id) {
    const rows = get().rows;
    const target = rows.find((row) => row.id === id);
    if (!target) return;
    const next = rows.filter((row) => row.id !== id);
    set({ rows: next });
    await persistTimelineTrack(next);
    logAction("TimelineTrack", "remove", target);
  },
  async toggleLock(id) {
    const rows = get().rows;
    const target = rows.find((row) => row.id === id);
    if (!target) return;
    const next = rows.map((row) => (row.id === id ? { ...row, locked: !row.locked } : row));
    set({ rows: next });
    await persistTimelineTrack(next);
    logAction("TimelineTrack", "lockChange", { id, locked: !target.locked });
  }
}));
