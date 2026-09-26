export const TrackPlayState = ["ACTIVE", "INVALID", "REPLACED"] as const;
export type TrackPlayState = (typeof TrackPlayState)[number];
export const TrackPlayStateText: Record<TrackPlayState, string> = {
  ACTIVE: "正常",
  INVALID: "失效",
  REPLACED: "被替换"
};
