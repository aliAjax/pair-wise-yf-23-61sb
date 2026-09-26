import type {CueScene} from "../types/CueScene";
import type {TimelineTrack} from "../types/TimelineTrack";
import type {TrackStatus} from "../types/TrackStatus";
import {parseMs} from "./formatters";

// 场景处于这些状态时，已排轨道一律标记为“失效”，不再参与播放。
const INVALID_SCENE_STATUSES = ["DISABLED", "ARCHIVED"];

const trackEnd = (track: TimelineTrack) => parseMs(track.start_ms) + parseMs(track.duration_ms);
const overlaps = (a: TimelineTrack, b: TimelineTrack) =>
  parseMs(a.start_ms) < trackEnd(b) && parseMs(b.start_ms) < trackEnd(a);

export function applyTrackStatuses(
  tracks: TimelineTrack[],
  scenes: CueScene[]
): { rows: TimelineTrack[]; changed: TimelineTrack[] } {
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const statusByTrack = new Map<number, TrackStatus>();

  // 第一步：场景缺失、停用或归档 => 轨道失效。
  for (const track of tracks) {
    const scene = sceneById.get(track.cue_scene_id);
    statusByTrack.set(track.id, !scene || INVALID_SCENE_STATUSES.includes(scene.scene_status) ? "INVALID" : "ACTIVE");
  }

  // 第二步：同层时间重叠时，优先级高的保留，低的标成“被替换”但留在原位。
  const activeByLayer = new Map<string, TimelineTrack[]>();
  for (const track of tracks) {
    if (statusByTrack.get(track.id) !== "ACTIVE") continue;
    const list = activeByLayer.get(track.layer) ?? [];
    list.push(track);
    activeByLayer.set(track.layer, list);
  }
  for (const layerTracks of activeByLayer.values()) {
    const sorted = [...layerTracks].sort((a, b) => {
      const pa = Number(sceneById.get(a.cue_scene_id)?.priority ?? 0);
      const pb = Number(sceneById.get(b.cue_scene_id)?.priority ?? 0);
      return pb - pa || parseMs(a.start_ms) - parseMs(b.start_ms) || a.id - b.id;
    });
    const kept: TimelineTrack[] = [];
    for (const track of sorted) {
      if (kept.some((winner) => overlaps(winner, track))) statusByTrack.set(track.id, "REPLACED");
      else kept.push(track);
    }
  }

  const rows = tracks.map((track) => ({ ...track, track_status: statusByTrack.get(track.id) ?? "ACTIVE" }));
  const changed = rows.filter((row, index) => row.track_status !== tracks[index].track_status);
  return { rows, changed };
}
