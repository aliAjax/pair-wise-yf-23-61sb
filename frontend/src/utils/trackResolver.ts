import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { TrackPlayState } from "../types/TrackPlayState";

export interface ResolvedTrack {
  track: TimelineTrack;
  scene: CueScene | undefined;
  state: TrackPlayState;
  /** Id of the higher-priority track that replaced this one. */
  replacedBy?: number;
}

/** 停用或归档的场景不再参与播放，其已排轨道标为失效。 */
export function isScenePlayable(scene: CueScene | undefined): boolean {
  return !!scene && scene.scene_status !== "DISABLED" && scene.scene_status !== "ARCHIVED";
}

function overlaps(a: TimelineTrack, b: TimelineTrack): boolean {
  return a.start_ms < b.start_ms + b.duration_ms && b.start_ms < a.start_ms + a.duration_ms;
}

/**
 * 推导每条轨道的播放状态：
 * 1. 场景缺失、停用或归档 -> INVALID（失效，不参与播放，也不再压制其他轨道）；
 * 2. 同一层时间重叠时，优先级高（并列时开始早、id 小）的轨道保留，
 *    较低的标为 REPLACED（被替换）并留在原位；
 * 3. 高优先级轨道被移除或失效后，被替换的轨道自动恢复为 ACTIVE。
 */
export function resolveTimeline(tracks: TimelineTrack[], scenes: CueScene[]): ResolvedTrack[] {
  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
  const resolved: ResolvedTrack[] = tracks.map((track) => {
    const scene = sceneMap.get(track.cue_scene_id);
    return {
      track,
      scene,
      state: isScenePlayable(scene) ? "ACTIVE" : "INVALID"
    };
  });

  const byLayer = new Map<number, ResolvedTrack[]>();
  for (const item of resolved) {
    if (item.state !== "ACTIVE") continue;
    const list = byLayer.get(item.track.layer) ?? [];
    list.push(item);
    byLayer.set(item.track.layer, list);
  }

  for (const list of byLayer.values()) {
    const ordered = [...list].sort(
      (a, b) =>
        (b.scene?.priority ?? 0) - (a.scene?.priority ?? 0) ||
        a.track.start_ms - b.track.start_ms ||
        a.track.id - b.track.id
    );
    const winners: ResolvedTrack[] = [];
    for (const candidate of ordered) {
      const overlappedBy = winners.find((winner) => overlaps(winner.track, candidate.track));
      if (overlappedBy) {
        candidate.state = "REPLACED";
        candidate.replacedBy = overlappedBy.track.id;
      } else {
        winners.push(candidate);
      }
    }
  }

  return resolved;
}

/** 实际参与播放的轨道（排除失效与被替换），按开始时间排序。 */
export function effectiveTracks(resolved: ResolvedTrack[]): ResolvedTrack[] {
  return resolved
    .filter((item) => item.state === "ACTIVE")
    .sort((a, b) => a.track.start_ms - b.track.start_ms || a.track.id - b.track.id);
}
