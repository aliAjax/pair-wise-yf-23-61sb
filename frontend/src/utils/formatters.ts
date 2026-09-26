export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

// 时间轴相关：毫秒字段在数据库中以字符串保存，这里统一解析与展示。
export const parseMs = (value: string | number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
export const formatMs = (value: string | number): string => {
  const ms = parseMs(value);
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} 秒` : `${ms} 毫秒`;
};
export const formatLayer = (value: string) => `层 ${value}`;

// 场景 fixture_states 是 JSON 字符串（{ 灯具id: 颜色 }），解析失败时返回空表。
export const parseFixtureStates = (json: string | undefined): Record<string, string> => {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
};
