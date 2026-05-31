/**
 * DeadlineDashFloor.ts （納期前ダッシュ床）
 * 乗ると強制的に走らされる床。勢いを使って先の谷を飛び越える。
 * 床自体は乗れる（solid）＋上に「強制ダッシュ」を伝えるセンサーを置く。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import type { StageBuildContext, ZoneData } from "../types";
import type { StageObject } from "../../data/stages";

export class DeadlineDashFloor {
  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const w = obj.w ?? 120;
    const h = obj.h ?? 8;
    const dir = obj.params?.dir ?? 1;

    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;

    // 乗れる床（黄色＋矢印で「走らされる」感）
    const rect = scene.add.rectangle(cx, cy, w, h, COLORS.yellow).setStrokeStyle(2, COLORS.red);
    ctx.solids.add(rect);

    // 矢印アニメ（流れる感じ）
    const arrow = scene.add
      .text(cx, obj.y - 16, dir > 0 ? "≫≫≫ DASH ≫≫≫" : "≪≪≪ DASH ≪≪≪", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: CSS.red,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    scene.tweens.add({ targets: arrow, alpha: 0.3, yoyo: true, repeat: -1, duration: 300 });

    // 床の上に薄いセンサーゾーン（ここに乗ると強制ダッシュ）
    const sensor = scene.add.zone(cx, obj.y - 8, w, 22) as ZoneData;
    scene.physics.add.existing(sensor);
    const body = sensor.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;
    sensor.dir = dir;
    ctx.dashZones.push(sensor);
  }
}
