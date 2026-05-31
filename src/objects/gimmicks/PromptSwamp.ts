/**
 * PromptSwamp.ts （プロンプト沼）
 * 入るとジャンプ力・移動速度が下がる沼。
 * 「プロンプトが長すぎて沈む」をイメージしたギミック。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import type { StageBuildContext, ZoneData } from "../types";
import type { StageObject } from "../../data/stages";

export class PromptSwamp {
  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const w = obj.w ?? 190;
    const h = obj.h ?? 70;

    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;

    // 沼の見た目（むらさきの半透明＋ぷくぷく）
    scene.add.rectangle(cx, cy, w, h, COLORS.purple, 0.45).setStrokeStyle(2, COLORS.purple);
    scene.add
      .text(cx, obj.y - 14, "プロンプト沼", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: CSS.textDark,
      })
      .setOrigin(0.5);
    // ぷくぷくする泡（演出）
    for (let i = 0; i < 3; i++) {
      const bubble = scene.add.circle(obj.x + 30 + i * 55, cy, 5, COLORS.white, 0.5);
      scene.tweens.add({
        targets: bubble,
        y: cy - 18,
        alpha: 0,
        duration: 1200,
        delay: i * 300,
        repeat: -1,
      });
    }

    // 効果ゾーン（overlap で player.inSwamp を立てる）
    const zone = scene.add.zone(cx, cy, w, h) as ZoneData;
    scene.physics.add.existing(zone);
    const body = zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;
    ctx.swampZones.push(zone);
  }
}
