export const LOG_TEMPLATES = {
  Fixture: {
    create: "灯具创建",
    update: "灯具更新",
    statusChange: "灯具状态变更",
    export: "灯具导出"
  },
  CueScene: {
    create: "灯光场景创建",
    update: "灯光场景更新",
    statusChange: "灯光场景状态变更",
    disable: "灯光场景停用",
    archive: "灯光场景归档",
    restore: "灯光场景恢复",
    export: "灯光场景导出"
  },
  TimelineTrack: {
    create: "时间轴轨道创建",
    update: "时间轴轨道更新",
    statusChange: "时间轴轨道状态变更",
    remove: "时间轴轨道移除",
    lockChange: "时间轴轨道锁定变更",
    export: "时间轴轨道导出"
  },
  ShowProject: {
    create: "演出方案创建",
    update: "演出方案更新",
    statusChange: "演出方案状态变更",
    export: "演出方案导出"
  }
} as const;

export type LogEntity = keyof typeof LOG_TEMPLATES;
