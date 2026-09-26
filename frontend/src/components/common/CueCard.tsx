import type { CueScene } from "../../types/CueScene";
import { CueStatusZh } from "../../constants/CueStatus";
import { formatMs } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";

export function CueCard({
  scene,
  selected,
  cornerBadge,
  onClick
}: {
  scene: CueScene;
  selected?: boolean;
  cornerBadge?: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className={"cue-card" + (selected ? " selected" : "")} onClick={onClick}>
      <span className="cue-card-head">
        <strong>{scene.name}</strong>
        <StatusBadge value={scene.scene_status} label={CueStatusZh[scene.scene_status as keyof typeof CueStatusZh] ?? scene.scene_status} />
      </span>
      <span className="cue-card-meta">
        淡入 {formatMs(scene.fade_in_ms)} · 保持 {formatMs(scene.hold_ms)} · 优先级 {scene.priority}
      </span>
      {cornerBadge ? <span className="cue-card-corner">{cornerBadge}</span> : null}
    </button>
  );
}
