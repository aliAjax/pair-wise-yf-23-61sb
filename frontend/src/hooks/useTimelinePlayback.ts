import { useEffect, useMemo, useState } from "react";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import { parseMs } from "../utils/formatters";

// 只有“有效”轨道参与播放；失效（场景停用/归档）与被替换的轨道被排除。
export function useTimelinePlayback(tracks: TimelineTrack[], scenes: CueScene[]) {
  const sceneById = useMemo(() => new Map(scenes.map((scene) => [scene.id, scene])), [scenes]);
  const playable = useMemo(
    () => tracks.filter((t) => t.track_status === "ACTIVE" && sceneById.has(t.cue_scene_id)),
    [tracks, sceneById]
  );
  const totalMs = useMemo(
    () => Math.max(0, ...playable.map((t) => parseMs(t.start_ms) + parseMs(t.duration_ms))),
    [playable]
  );
  const [currentMs, setCurrentMs] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrentMs((ms) => (totalMs > 0 && ms + 100 >= totalMs ? 0 : ms + 100));
    }, 100);
    return () => clearInterval(timer);
  }, [playing, totalMs]);

  const activeTrack = useMemo(() => {
    const covering = playable.filter(
      (t) => parseMs(t.start_ms) <= currentMs && currentMs < parseMs(t.start_ms) + parseMs(t.duration_ms)
    );
    return covering.sort((a, b) => parseMs(a.layer) - parseMs(b.layer))[0];
  }, [playable, currentMs]);

  return {
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    reset: () => setCurrentMs(0),
    currentMs,
    totalMs,
    activeTrack,
    playableCount: playable.length
  };
}
