/**
 * input.ts
 * キーボード入力をまとめて扱うためのヘルパー。
 * 操作: 左=←/A, 右=→/D, ジャンプ=Space/W, リトライ=R, ポーズ=Esc
 */
import Phaser from "phaser";

export interface GameKeys {
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
  jump: Phaser.Input.Keyboard.Key[];
  retry: Phaser.Input.Keyboard.Key;
  pause: Phaser.Input.Keyboard.Key;
}

/** シーンのキーボードからゲーム用キー定義を作る。 */
export function createKeys(scene: Phaser.Scene): GameKeys {
  const kb = scene.input.keyboard!;
  const K = Phaser.Input.Keyboard.KeyCodes;
  return {
    left: [kb.addKey(K.LEFT), kb.addKey(K.A)],
    right: [kb.addKey(K.RIGHT), kb.addKey(K.D)],
    jump: [kb.addKey(K.SPACE), kb.addKey(K.W), kb.addKey(K.UP)],
    retry: kb.addKey(K.R),
    pause: kb.addKey(K.ESC),
  };
}

/** 複数キーのうちどれかが押されていれば true。 */
export function isDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
  return keys.some((k) => k.isDown);
}

/** 複数キーのうちどれかが「今フレームで押された瞬間」なら true。 */
export function justDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
  return keys.some((k) => Phaser.Input.Keyboard.JustDown(k));
}
