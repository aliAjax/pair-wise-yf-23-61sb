import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";

// 检查 DMX 地址段（地址 ~ 地址+通道数-1）是否互相重叠。
export function useDmxAddressCheck(fixtures: Fixture[]) {
  return useMemo(() => {
    const ranges = fixtures.map((f) => {
      const start = Number(f.dmx_address) || 0;
      return { fixture: f, start, end: start + (Number(f.channel_count) || 1) - 1 };
    });
    const conflicts: string[] = [];
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        if (ranges[i].start <= ranges[j].end && ranges[j].start <= ranges[i].end) {
          conflicts.push(`${ranges[i].fixture.fixture_code} 与 ${ranges[j].fixture.fixture_code} 的 DMX 通道重叠`);
        }
      }
    }
    return { conflicts, hasConflict: conflicts.length > 0 };
  }, [fixtures]);
}
