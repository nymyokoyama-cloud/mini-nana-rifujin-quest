/**
 * types.ts
 * ステージ上のオブジェクト（足場・トラップ・ギミック）を作るときに渡す
 * 共通の「文脈オブジェクト」の型定義。
 * GameScene を直接 import すると循環参照になるため、ここにインターフェイスを切り出す。
 */
import Phaser from "phaser";
import type { Player } from "./Player";

// 毎フレーム更新が必要なオブジェクト
export interface Updatable {
  update(time: number, delta: number): void;
}

// 死亡/リトライ時に状態を初期化できるオブジェクト
export interface Resettable {
  reset(): void;
}

// ゾーン（沼・風・ダッシュ床のセンサー）に持たせる追加情報
export interface ZoneData extends Phaser.GameObjects.Zone {
  dir?: number; // 向き(-1/+1)
  force?: number; // 風の基準の強さ
  currentForce?: number; // 風: 今この瞬間の強さ（突風のON/OFF）
}

// オブジェクト生成時に渡す文脈
export interface StageBuildContext {
  scene: Phaser.Scene;
  // 物理グループ
  solids: Phaser.Physics.Arcade.StaticGroup; // 乗れる床（プレイヤーと衝突）
  traps: Phaser.Physics.Arcade.Group; // 触れると即死
  swampZones: ZoneData[]; // 沼
  windZones: ZoneData[]; // 風
  dashZones: ZoneData[]; // ダッシュ床のセンサー
  // 登録系
  registerUpdatable(u: Updatable): void;
  registerResettable(r: Resettable): void;
  registerGate(id: string, gate: { open(): void; close(): void }): void;
  collectKey(id: string): void;
  // 参照
  getPlayer(): Player;
}
