export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  SCENE_FORM_INVALID: "场景名称不能为空，淡入/保持需为不小于 0 的毫秒数，优先级需为 0-99 的整数",
  SCENE_NOT_FOUND: "场景不存在或已被删除",
  TRACK_LOCKED: "轨道已锁定，无法修改或移除",
  TRACK_NOT_FOUND: "时间轴轨道不存在或已被移除"
};
