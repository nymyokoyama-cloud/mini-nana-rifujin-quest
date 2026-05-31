/**
 * Checkpoint.ts
 * チェックポイント。触れると復活地点が更新される旗。
 * 重なり判定と「到達済み」表示は GameScene が管理する。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../config";
import type { StageBuildContext } from "./types";
import type { StageObject } from "../data/stages";

export class Checkpoint {
  public readonly zone: Phaser.GameObjects.Zone;
  public readonly spawnX: number;
  public readonly spawnY: number;
  private pole: Phaser.GameObjects.Rectangle;
  private flag: Phaser.GameObjects.Triangle;
  private label: Phaser.GameObjects.Text;
  public activated = false;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    this.spawnX = obj.x;
    this.spawnY = obj.y;

    // 旗の見た目（ポール＋三角の旗）
    const top = obj.y - 80;
    this.pole = scene.add.rectangle(obj.x, obj.y - 40, 6, 80, COLORS.black).setOrigin(0.5, 0.5);
    this.flag = scene.add
      .triangle(obj.x + 3, top + 12, 0, 0, 34, 10, 0, 20, COLORS.gray)
      .setOrigin(0, 0.5);
    this.label = scene.add
      .text(obj.x, top - 14, "CP", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: CSS.textDark,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // 当たり判定ゾーン
    this.zone = scene.add.zone(obj.x, obj.y - 40, 50, 90);
    scene.physics.add.existing(this.zone);
    const body = this.zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;
  }

  /** 到達したときの見た目変更（旗をピンクに）。 */
  public activate(): void {
    if (this.activated) return;
    this.activated = true;
    this.flag.setFillStyle(COLORS.pink);
    this.label.setColor(CSS.pinkDeep);
    // ぴょこっと跳ねる演出
    this.flag.scene.tweens.add({
      targets: this.flag,
      scaleX: 1.3,
      yoyo: true,
      duration: 150,
    });
  }

  public reset(): void {
    // 到達状態は維持（チェックポイントは一度取れば有効のまま）
  }
}
