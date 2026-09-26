import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { parseFixtureStates, parseMs } from "../utils/formatters";
import { StageCanvas } from "../components/common/StageCanvas";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { StatCard } from "../components/common/StatCard";

const PX_PER_MS = 0.06;

export function PreviewPage() {
  const { rows: tracks } = useIndexedDbStore(useTimelineTrackStore());
  const { rows: scenes } = useIndexedDbStore(useCueSceneStore());
  const { rows: fixtures } = useIndexedDbStore(useFixtureStore());
  const { playing, play, pause, reset, currentMs, totalMs, activeTrack, playableCount } =
    useTimelinePlayback(tracks, scenes);

  const activeScene = activeTrack ? scenes.find((s) => s.id === activeTrack.cue_scene_id) : undefined;
  const states = parseFixtureStates(activeScene?.fixture_states);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light / 联排</p>
          <h1>舞台预览</h1>
        </div>
        <div className="toolbar">
          {playing ? (
            <button type="button" className="primary" onClick={pause}>暂停</button>
          ) : (
            <button type="button" className="primary" onClick={play}>播放</button>
          )}
          <button type="button" onClick={reset}>回到起点</button>
        </div>
      </section>

      <section className="metrics">
        <StatCard label="播放进度" value={`${(currentMs / 1000).toFixed(1)}s / ${(totalMs / 1000).toFixed(1)}s`} />
        <StatCard label="当前场景" value={activeScene?.name ?? "（无）"} />
        <StatCard label="可播放轨道" value={playableCount} />
      </section>

      <section className="panel wide">
        <h2>二维舞台</h2>
        <StageCanvas fixtures={fixtures} states={states} />
        <p className="hint">仅“有效”轨道参与播放；失效（场景停用/归档）与“被替换”的轨道已自动排除。</p>
      </section>

      <section className="panel wide">
        <h2>播放位置</h2>
        <div className="timeline-scroll">
          <TimelineRuler totalMs={Math.max(totalMs, parseMs("1000"))} pxPerMs={PX_PER_MS} currentMs={currentMs} />
        </div>
      </section>
    </main>
  );
}
