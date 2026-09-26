import { mockData } from "../mocks/seedData";
import { idbGetAllSeeded, idbPut } from "../utils/idb";
import type { ShowProject } from "../types/ShowProject";

export async function listShowProject(): Promise<ShowProject[]> {
  return idbGetAllSeeded("showProject", mockData.showProject as unknown as ShowProject[]);
}

export async function saveShowProject(payload: ShowProject) {
  await idbPut("showProject", payload);
  return payload;
}
