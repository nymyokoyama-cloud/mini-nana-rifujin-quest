/**
 * Trap.ts
 * 触れると即死するトゲ。見た目は赤い三角の列、当たり判定は少し小さめの矩形。
 */
import Phaser from "phaser";
import { COLORS } from "../config";
import type { StageBuildContext } from "./types";
import type { StageObject } from "../data/stages";

export class Trap {
  constructor(ctx: StageBuildContext, obj: StageObject, reason = "spike") {
    const scene = ctx.scene;
    const w = obj.w ?? 34;
    const h = obj.h ?? 24;

    // --- 見た目: 赤い三角を並べる ---
    const g = scene.add.graphics();
    g.fillStyle(COLORS.red, 1);
    g.lineStyle(2, COLORS.black, 1);
    const spikeW = 17;
    const count = Math.max(1, Math.round(w / spikeW));
    const actualW = w / count;
    for (let i = 0; i < count; i++) {
      const left = obj.x + i * actualW;
      g.beginPath();
      g.moveTo(left, obj.y + h);
      g.lineTo(left + actualW / 2, obj.y);
      g.lineTo(left + actualW, obj.y + h);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }

    // --- 当たり判定: 見た目より少し内側のゾーン（理不尽さ軽減） ---
    const inset = 5;
    const zone = scene.add.zone(obj.x + w / 2, obj.y + h / 2, Math.max(4, w - inset * 2), Math.max(4, h - inset));
    // グループに追加すると動的ボディが付く。動かない罠として設定する。
    ctx.traps.add(zone);
    const body = zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.moves = false;
    zone.setData("reason", reason);
  }
}
