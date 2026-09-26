import { mockData } from "../mocks/seedData";
import { idbGetAllSeeded, idbPut } from "../utils/idb";
import type { CueScene } from "../types/CueScene";

export async function listCueScene(): Promise<CueScene[]> {
  return idbGetAllSeeded("cueScene", mockData.cueScene as unknown as CueScene[]);
}

export async function saveCueScene(payload: CueScene) {
  await idbPut("cueScene", payload);
  return payload;
}
