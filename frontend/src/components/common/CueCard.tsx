import { CueStatusText } from "../../constants/CueStatus";
import { formatMs, formatPriority } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import type { CueScene } from "../../types/CueScene";

const STATUS_TONE: Record<string, "ok" | "warn" | "bad" | "muted"> = {
  DRAFT: "muted",
  READY: "ok",
  DISABLED: "warn",
  ARCHIVED: "bad"
};

export function CueCard({
  scene,
  selected = false,
  onSelect
}: {
  scene: CueScene;
  selected?: boolean;
  onSelect?: (scene: CueScene) => void;
}) {
  return (
    <button
      type="button"
      className={"cue-card" + (selected ? " selected" : "")}
      onClick={() => onSelect?.(scene)}
    >
      <span className="cue-card-head">
        <strong>{scene.name}</strong>
        <StatusBadge value={CueStatusText[scene.scene_status]} tone={STATUS_TONE[scene.scene_status]} />
      </span>
      <span className="cue-card-meta">
        <span>优先级 {formatPriority(scene.priority)}</span>
        <span>淡入 {formatMs(scene.fade_in_ms)}</span>
        <span>保持 {formatMs(scene.hold_ms)}</span>
      </span>
    </button>
  );
}
