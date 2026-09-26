export const TrackStatus = ["ACTIVE", "INVALID", "REPLACED"] as const;
export type TrackStatus = (typeof TrackStatus)[number];
export const TrackStatusText: Record<TrackStatus, string> = {
  ACTIVE: "有效",
  INVALID: "失效",
  REPLACED: "被替换"
};
