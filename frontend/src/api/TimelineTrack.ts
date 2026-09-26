import { mockData } from "../mocks/seedData";
import { idbDelete, idbGetAllSeeded, idbPut } from "../utils/idb";
import type { TimelineTrack } from "../types/TimelineTrack";

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  return idbGetAllSeeded("timelineTrack", mockData.timelineTrack as unknown as TimelineTrack[]);
}

export async function saveTimelineTrack(payload: TimelineTrack) {
  await idbPut("timelineTrack", payload);
  return payload;
}

export async function deleteTimelineTrack(id: number) {
  await idbDelete("timelineTrack", id);
}
