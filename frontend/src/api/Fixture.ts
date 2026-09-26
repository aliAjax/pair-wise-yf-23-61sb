import { mockData } from "../mocks/seedData";
import { idbGetAllSeeded, idbPut } from "../utils/idb";
import type { Fixture } from "../types/Fixture";

export async function listFixture(): Promise<Fixture[]> {
  return idbGetAllSeeded("fixture", mockData.fixture as unknown as Fixture[]);
}

export async function saveFixture(payload: Fixture) {
  await idbPut("fixture", payload);
  return payload;
}
