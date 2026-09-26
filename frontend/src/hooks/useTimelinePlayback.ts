import { useEffect, useMemo, useRef, useState } from "react";
import { effectiveTracks, type ResolvedTrack } from "../utils/trackResolver";

const TICK_MS = 100;

/**
 * 时间轴播放：只播放状态为 ACTIVE 的轨道，
 * 失效（场景停用/归档）与被替换的轨道不参与播放。
 */
export function useTimelinePlayback(resolved: ResolvedTrack[]) {
  const segments = useMemo(() => effectiveTracks(resolved), [resolved]);
  const totalMs = useMemo(
    () => segments.reduce((max, item) => Math.max(max, item.track.start_ms + item.track.duration_ms), 0),
    [segments]
  );
  const [nowMs, setNowMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const nowRef = useRef(0);
  nowRef.current = nowMs;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const next = nowRef.current + TICK_MS;
      if (next >= totalMs) {
        setNowMs(totalMs);
        setPlaying(false);
      } else {
        setNowMs(next);
      }
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [playing, totalMs]);

  const activeNow = useMemo(
    () =>
      segments.filter(
        (item) => nowMs >= item.track.start_ms && nowMs < item.track.start_ms + item.track.duration_ms
      ),
    [segments, nowMs]
  );

  return {
    segments,
    totalMs,
    nowMs,
    playing,
    activeNow,
    play: () => {
      if (totalMs === 0) return;
      if (nowRef.current >= totalMs) setNowMs(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    stop: () => {
      setPlaying(false);
      setNowMs(0);
    },
    seek: (ms: number) => setNowMs(Math.min(Math.max(0, ms), totalMs))
  };
}
