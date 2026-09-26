import { mockData } from "../mocks/seedData";
import { loadCollection, saveCollection } from "../utils/persistence";
import type { TimelineTrack } from "../types/TimelineTrack";

const STORAGE_KEY = "timelineTrack";

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  return loadCollection<TimelineTrack>(STORAGE_KEY, mockData.timelineTrack as unknown as TimelineTrack[]);
}

export async function persistTimelineTrack(rows: TimelineTrack[]): Promise<TimelineTrack[]> {
  saveCollection(STORAGE_KEY, rows);
  return rows;
}
