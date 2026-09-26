import { mockData } from "../mocks/seedData";
import { loadCollection, saveCollection } from "../utils/persistence";
import type { CueScene } from "../types/CueScene";

const STORAGE_KEY = "cueScene";

export async function listCueScene(): Promise<CueScene[]> {
  return loadCollection<CueScene>(STORAGE_KEY, mockData.cueScene as unknown as CueScene[]);
}

export async function persistCueScene(rows: CueScene[]): Promise<CueScene[]> {
  saveCollection(STORAGE_KEY, rows);
  return rows;
}
