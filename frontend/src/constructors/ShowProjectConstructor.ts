import type { ShowProject } from "../types/ShowProject";

export const createDefaultShowProject = (overrides: Partial<ShowProject> = {}): ShowProject => ({
  id: 0,
  title: "联排方案",
  venue_name: "实验剧场",
  fixture_ids: [],
  track_ids: [],
  updated_at: "2026-09-26T09:00:00Z",
  ...overrides
});

export const createShowProjectForm = createDefaultShowProject;
export const createShowProjectResponse = createDefaultShowProject;
