import { useEffect } from "react";

// 页面挂载时从 IndexedDB 支撑的 store 加载数据，重新打开页面即可恢复最后一次保存的排布与状态。
export function useIndexedDbStore<T>(source: { rows: T[]; loading: boolean; load: () => Promise<void> }) {
  const { rows, loading, load } = source;
  useEffect(() => {
    void load();
  }, [load]);
  return { rows, loading };
}
