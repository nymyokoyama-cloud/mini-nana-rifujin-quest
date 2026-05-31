/**
 * GeneratingPlatform.ts （生成中足場）
 * 「生成中…」と表示された足場が、一定間隔で出たり消えたりする。
 * タイミングよく渡る覚えゲー要素。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import type { StageBuildContext, Updatable, Resettable } from "../types";
import type { StageObject } from "../../data/stages";

export class GeneratingPlatform implements Updatable, Resettable {
  private rect: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private outline: Phaser.GameObjects.Rectangle;

  private onMs: number;
  private offMs: number;
  private offsetMs: number;
  private present = true;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const w = obj.w ?? 95;
    const h = obj.h ?? 22;
    this.onMs = obj.params?.onMs ?? 1300;
    this.offMs = obj.params?.offMs ?? 900;
    this.offsetMs = obj.params?.offsetMs ?? 0;

    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;

    // 消えているときに見える「枠」と「生成中…」表示
    this.outline = scene.add
      .rectangle(cx, cy, w, h, COLORS.sky, 0.12)
      .setStrokeStyle(2, COLORS.sky, 0.6);
    this.label = scene.add
      .text(cx, cy - 1, "生成中…", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: CSS.sky,
      })
      .setOrigin(0.5);

    // 本体（出ているときだけ乗れる）
    this.rect = scene.add.rectangle(cx, cy, w, h, COLORS.sky).setStrokeStyle(3, COLORS.white);
    ctx.solids.add(this.rect);

    ctx.registerUpdatable(this);
    ctx.registerResettable(this);
  }

  update(time: number): void {
    const cycle = this.onMs + this.offMs;
    const t = (time + this.offsetMs) % cycle;
    const shouldBePresent = t < this.onMs;
    if (shouldBePresent !== this.present) {
      this.setPresent(shouldBePresent);
    }
    // 消える直前は点滅して予告（少しだけ親切に）
    if (this.present && t > this.onMs - 350) {
      this.rect.setAlpha(0.4 + 0.3 * Math.sin(time / 40));
    } else if (this.present) {
      this.rect.setAlpha(1);
    }
  }

  private setPresent(present: boolean): void {
    this.present = present;
    const body = this.rect.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = present;
    this.rect.setVisible(present);
    this.rect.setAlpha(1);
    this.label.setVisible(!present);
    this.outline.setVisible(!present);
  }

  reset(): void {
    // 周期はワールド時間ベースなので状態は次の update で自然に揃う
    this.setPresent(true);
  }
}
