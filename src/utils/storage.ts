/**
 * storage.ts
 * localStorage を使ったベスト記録の保存・読み込み。
 * 失敗しても落ちないように try/catch で包む（プライベートブラウズ等で例外になることがある）。
 */

const KEY = "mini-nana-rifujin-quest:best";

export interface BestRecord {
  deaths: number; // 最少死亡回数
  timeMs: number; // ベストタイム(ms)
}

export function loadBest(): BestRecord | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as BestRecord;
    if (typeof data.deaths === "number" && typeof data.timeMs === "number") {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 今回の記録がベストを更新したら保存する。
 * 「死亡回数が少ない」を優先し、同数ならタイムが速い方を採用。
 * 戻り値: 更新されたら true。
 */
export function saveIfBest(record: BestRecord): boolean {
  try {
    const prev = loadBest();
    const isBetter =
      !prev ||
      record.deaths < prev.deaths ||
      (record.deaths === prev.deaths && record.timeMs < prev.timeMs);
    if (isBetter) {
      localStorage.setItem(KEY, JSON.stringify(record));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
