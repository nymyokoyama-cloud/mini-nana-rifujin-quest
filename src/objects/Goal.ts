/**
 * Goal.ts
 * ゴール。本物ゴール(goal)と偽ゴール(fakeGoal)の2種類。
 * 偽ゴールは触れてもクリアにならない（メッセージだけ出る）。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../config";
import type { StageBuildContext } from "./types";
import type { StageObject } from "../data/stages";

export class Goal {
  public readonly zone: Phaser.GameObjects.Zone;
  public readonly isFake: boolean;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    this.isFake = obj.type === "fakeGoal";

    const color = this.isFake ? COLORS.gray : COLORS.yellow;
    const labelText = this.isFake ? "やさしいゴール？" : "GOAL";

    // ゴールゲートの見た目（光る門っぽい縦長）
    const top = obj.y - 110;
    const gate = scene.add
      .rectangle(obj.x, obj.y - 55, 60, 110, color, this.isFake ? 0.9 : 1)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(4, COLORS.white);
    const star = scene.add
      .star(obj.x, obj.y - 70, 5, 10, 22, this.isFake ? COLORS.white : COLORS.pink)
      .setOrigin(0.5);
    scene.add
      .text(obj.x, top - 12, labelText, {
        fontFamily: "sans-serif",
        fontSize: "15px",
        color: this.isFake ? CSS.textDark : CSS.pinkDeep,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // 本物ゴールはキラキラさせる
    if (!this.isFake) {
      scene.tweens.add({
        targets: star,
        angle: 360,
        duration: 4000,
        repeat: -1,
      });
      scene.tweens.add({
        targets: gate,
        alpha: 0.7,
        yoyo: true,
        repeat: -1,
        duration: 700,
      });
    }

    // 当たり判定
    this.zone = scene.add.zone(obj.x, obj.y - 55, 60, 110);
    scene.physics.add.existing(this.zone);
    const body = this.zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;
  }
}
