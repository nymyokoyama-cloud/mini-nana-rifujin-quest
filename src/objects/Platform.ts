/**
 * Platform.ts
 * 普通の足場・地面。乗れる固定ブロック（静的ボディ）を作る。
 */
import Phaser from "phaser";
import { COLORS } from "../config";
import type { StageBuildContext } from "./types";
import type { StageObject } from "../data/stages";

export class Platform {
  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const w = obj.w ?? 100;
    const h = obj.h ?? 24;
    const isGround = obj.type === "ground";

    // 中心座標で四角を置く（Rectangle は origin 0.5 が基準）
    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;

    const fill = isGround ? COLORS.green : COLORS.pink;
    const rect = scene.add.rectangle(cx, cy, w, h, fill);
    rect.setStrokeStyle(3, COLORS.white);

    // 地面は土っぽく上面ラインを足す（見た目のアクセント）
    if (isGround) {
      scene.add
        .rectangle(cx, obj.y + 5, w, 10, COLORS.yellow, 0.5)
        .setStrokeStyle(0);
    }

    // 静的ボディを付けて衝突グループへ
    ctx.solids.add(rect);
  }
}
