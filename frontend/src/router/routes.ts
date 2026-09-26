import type { ComponentType } from "react";
import { FixturesPage } from "../pages/FixturesPage";
import { CuesPage } from "../pages/CuesPage";
import { TimelinePage } from "../pages/TimelinePage";
import { PreviewPage } from "../pages/PreviewPage";

export interface PageProps {
  onNavigate?: (route: string) => void;
}

export const routes: { name: string; route: string; Component: ComponentType<PageProps> }[] = [
  {
    name: "灯具布置",
    route: "/fixtures",
    Component: FixturesPage
  },
  {
    name: "场景编辑",
    route: "/cues",
    Component: CuesPage
  },
  {
    name: "时间轴编排",
    route: "/timeline",
    Component: TimelinePage
  },
  {
    name: "舞台预览",
    route: "/preview",
    Component: PreviewPage
  }
];
