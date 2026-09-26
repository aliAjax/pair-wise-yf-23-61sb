import { applyTrackStatuses } from "../frontend/src/utils/trackStatusResolver";

const scenes = [
  { id: 1, name: "A", fixture_states: "{}", fade_in_ms: "500", hold_ms: "1000", priority: "5", scene_status: "READY" },
  { id: 2, name: "B", fixture_states: "{}", fade_in_ms: "500", hold_ms: "1000", priority: "20", scene_status: "READY" },
  { id: 3, name: "C", fixture_states: "{}", fade_in_ms: "500", hold_ms: "1000", priority: "9", scene_status: "DISABLED" },
  { id: 4, name: "D", fixture_states: "{}", fade_in_ms: "500", hold_ms: "1000", priority: "9", scene_status: "ARCHIVED" }
];

const t = (id, scene, start, dur, layer = "1") => ({
  id, cue_scene_id: scene, start_ms: String(start), duration_ms: String(dur), layer: layer, locked: "false", track_status: "ACTIVE"
});

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const ok = got === want;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: got=${got} want=${want}`);
  ok ? pass++ : fail++;
};

// 1. 停用/归档 => 失效
{
  const { rows } = applyTrackStatuses([t(1, 3, 0, 2000), t(2, 4, 0, 2000), t(3, 1, 0, 2000)], scenes);
  check("停用场景轨道失效", rows[0].track_status, "INVALID");
  check("归档场景轨道失效", rows[1].track_status, "INVALID");
  check("正常场景轨道有效", rows[2].track_status, "ACTIVE");
}

// 2. 同层重叠 => 高优先级保留，低优先级被替换
{
  const { rows } = applyTrackStatuses([t(1, 1, 0, 5000), t(2, 2, 3000, 5000)], scenes);
  check("低优先级被替换", rows[0].track_status, "REPLACED");
  check("高优先级保留", rows[1].track_status, "ACTIVE");
}

// 3. 撤销高优先级轨道 => 原场景恢复
{
  const tracks = [t(1, 1, 0, 5000), t(2, 2, 3000, 5000)];
  const before = applyTrackStatuses(tracks, scenes).rows;
  check("替换发生", before[0].track_status, "REPLACED");
  const after = applyTrackStatuses(before.filter((x) => x.id !== 2), scenes).rows;
  check("移除高优先级后恢复", after[0].track_status, "ACTIVE");
}

// 4. 不同层重叠 => 互不影响
{
  const { rows } = applyTrackStatuses([t(1, 1, 0, 5000), t(2, 2, 3000, 5000, "2")], scenes);
  check("跨层轨道1", rows[0].track_status, "ACTIVE");
  check("跨层轨道2", rows[1].track_status, "ACTIVE");
}

// 5. 同层首尾相接不算重叠
{
  const { rows } = applyTrackStatuses([t(1, 1, 0, 3000), t(2, 2, 3000, 3000)], scenes);
  check("相接轨道1", rows[0].track_status, "ACTIVE");
  check("相接轨道2", rows[1].track_status, "ACTIVE");
}

// 6. 失效轨道不参与替换别人，也不被别人替换
{
  const { rows } = applyTrackStatuses([t(1, 3, 0, 5000), t(2, 1, 1000, 2000)], scenes);
  check("失效轨道保持失效", rows[0].track_status, "INVALID");
  check("有效轨道不被失效轨道替换", rows[1].track_status, "ACTIVE");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
