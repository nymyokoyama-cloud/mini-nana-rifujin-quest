/**
 * HallucinationFloor.ts （ハルシネーション床）
 * 乗れるように見えるが、乗る/近づくと消える床。
 * AIの「それっぽい勘違い」をゲーム化したオリジナルギミック。
 *
 * trigger:
 *   "step"      … 乗った瞬間に床が抜ける
 *   "proximity" … 一定距離まで近づくと消える
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import type { StageBuildContext, Updatable, Resettable } from "../types";
import type { StageObject } from "../../data/stages";

type State = "solid" | "gone";

export class HallucinationFloor implements Updatable, Resettable {
  public readonly reason = "hallucination";
  private ctx: StageBuildContext;
  private rect: Phaser.GameObjects.Rectangle;
  private hint: Phaser.GameObjects.Text;
  private state: State = "solid";
  private trigger: "step" | "proximity";

  private readonly left: number;
  private readonly right: number;
  private readonly top: number;
  private readonly centerX: number;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    this.ctx = ctx;
    const scene = ctx.scene;
    const w = obj.w ?? 95;
    const h = obj.h ?? 22;
    this.trigger = obj.params?.trigger ?? "step";

    this.left = obj.x;
    this.right = obj.x + w;
    this.top = obj.y;
    this.centerX = obj.x + w / 2;

    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;
    // 普通の足場とほぼ同じ見た目。よく見ると小さな「?」がある（覚えれば見抜ける）
    this.rect = scene.add.rectangle(cx, cy, w, h, COLORS.pink);
    this.rect.setStrokeStyle(3, COLORS.white);
    this.hint = scene.add
      .text(cx, cy - 1, "?", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: CSS.white,
      })
      .setOrigin(0.5)
      .setAlpha(0.5);

    ctx.solids.add(this.rect);
    ctx.registerUpdatable(this);
    ctx.registerResettable(this);
  }

  update(): void {
    if (this.state !== "solid") return;
    const player = this.ctx.getPlayer();
    if (!player.alive) return;
    const pb = player.body as Phaser.Physics.Arcade.Body;

    if (this.trigger === "proximity") {
      // 近づくと消える（横の距離で判定）
      const near = Math.abs(player.x - this.centerX) < 64 && Math.abs(pb.bottom - this.top) < 120;
      if (near) this.vanish();
    } else {
      // 乗った瞬間に抜ける
      const horiz = pb.right > this.left + 4 && pb.left < this.right - 4;
      const onTop = Math.abs(pb.bottom - this.top) < 6 && (pb.blocked.down || pb.touching.down);
      if (horiz && onTop) this.vanish();
    }
  }

  private vanish(): void {
    this.state = "gone";
    // すぐに当たり判定を消す（床が抜ける）
    const body = this.rect.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = false;
    // ふわっと消える演出
    this.rect.scene.tweens.add({
      targets: [this.rect, this.hint],
      alpha: 0,
      duration: 160,
    });
  }

  reset(): void {
    this.state = "solid";
    const body = this.rect.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = true;
    this.rect.setAlpha(1);
    this.hint.setAlpha(0.5);
  }
}
