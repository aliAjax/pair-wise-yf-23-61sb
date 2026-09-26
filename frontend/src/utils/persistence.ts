const PREFIX = "stage-light/v1/";

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function loadCollection<T extends { id: number }>(key: string, seed: readonly T[]): T[] {
  const raw = readRaw(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Corrupted payload falls back to the seed below.
    }
  }
  return seed.map((row) => ({ ...row }));
}

export function saveCollection<T>(key: string, rows: T[]): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(rows));
  } catch {
    // Storage full or unavailable: keep the in-memory state authoritative.
  }
}

export function resetCollections(): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(PREFIX)) doomed.push(key);
    }
    doomed.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore: reset is best-effort.
  }
}
