/**
 * timer.ts
 * 経過時間の計測と表示整形をまとめたユーティリティ。
 */

/** ミリ秒を mm:ss.cs（分:秒.センチ秒）形式の文字列にする。 */
export function formatTime(ms: number): string {
  const totalCs = Math.floor(ms / 10); // センチ秒(1/100秒)
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  return `${pad(min)}:${pad(sec)}.${pad(cs)}`;
}

/** シンプルな経過時間ストップウォッチ。 */
export class Stopwatch {
  private startedAt = 0;
  private accumulated = 0;
  private running = false;

  start(now: number): void {
    this.startedAt = now;
    this.accumulated = 0;
    this.running = true;
  }

  pause(now: number): void {
    if (this.running) {
      this.accumulated += now - this.startedAt;
      this.running = false;
    }
  }

  resume(now: number): void {
    if (!this.running) {
      this.startedAt = now;
      this.running = true;
    }
  }

  /** 現在の経過ミリ秒。 */
  elapsed(now: number): number {
    return this.accumulated + (this.running ? now - this.startedAt : 0);
  }
}
