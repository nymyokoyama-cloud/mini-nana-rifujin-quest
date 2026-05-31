/**
 * EasyPath.ts （やさしい道）
 * 「初心者向け」と書かれた、一見やさしそうな平らな道。
 * でも実はトゲがいくつも隠れている意地悪ギミック。
 *
 * このクラスは「平らな地面 ＋ 看板 ＋ トゲの列」をまとめて作る合成ギミック。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import { Trap } from "../Trap";
import type { StageBuildContext } from "../types";
import type { StageObject } from "../../data/stages";

export class EasyPath {
  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const w = obj.w ?? 460;
    const h = obj.h ?? 40;
    const top = obj.y;
    const spikeOffsets = (obj.params as { spikes?: number[] })?.spikes ?? [100, 220, 310, 400];
    const spikeW = 34;
    const spikeH = 24;

    // 平らな地面（安全そうに見える緑の道）
    const cx = obj.x + w / 2;
    const cy = top + h / 2;
    const rect = scene.add.rectangle(cx, cy, w, h, COLORS.green).setStrokeStyle(3, COLORS.white);
    scene.add.rectangle(cx, top + 5, w, 10, COLORS.yellow, 0.5);
    ctx.solids.add(rect);

    // 「初心者向け♪」の安心させる看板
    scene.add
      .text(obj.x + 70, top - 22, "やさしい道 ♪ 初心者向け", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: CSS.pinkDeep,
        fontStyle: "bold",
        backgroundColor: "#ffffff",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0, 1);

    // 道の上にトゲを点在させる（これがオチ）
    for (const off of spikeOffsets) {
      const spikeObj: StageObject = {
        type: "spike",
        x: obj.x + off,
        y: top - spikeH,
        w: spikeW,
        h: spikeH,
      };
      new Trap(ctx, spikeObj, "easyPath");
    }
  }
}
