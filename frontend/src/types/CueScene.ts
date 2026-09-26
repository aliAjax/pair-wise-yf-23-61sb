import type { CueStatus } from "./CueStatus";

export interface CueScene {
  id: number;
  name: string;
  fixture_states: string;
  fade_in_ms: number;
  hold_ms: number;
  priority: number;
  scene_status: CueStatus;
}
