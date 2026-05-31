/**
 * AlgorithmWind.ts （アルゴリズムの風）
 * 突然横から風が吹いてプレイヤーを押し戻す。
 * 一定間隔で「突風(ON)」と「凪(OFF)」を繰り返すので、凪のあいだに進む。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import type { StageBuildContext, Updatable, Resettable, ZoneData } from "../types";
import type { StageObject } from "../../data/stages";

export class AlgorithmWind implements Updatable, Resettable {
  private zone: ZoneData;
  private arrows: Phaser.GameObjects.Text;
  private banner: Phaser.GameObjects.Rectangle;
  private baseForce: number;
  private dir: number;

  // 突風の周期（覚えれば抜けられるリズム）
  private readonly gustMs = 1600;
  private readonly calmMs = 1400;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const w = obj.w ?? 300;
    const h = obj.h ?? 220;
    this.baseForce = obj.params?.force ?? 380;
    this.dir = obj.params?.dir ?? -1;

    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;

    // 風ゾーンの見た目（薄い帯＋矢印）
    this.banner = scene.add.rectangle(cx, cy, w, h, COLORS.sky, 0.12);
    this.arrows = scene.add
      .text(cx, obj.y + 16, this.dir < 0 ? "≪ ≪ ≪" : "≫ ≫ ≫", {
        fontFamily: "sans-serif",
        fontSize: "26px",
        color: CSS.sky,
      })
      .setOrigin(0.5)
      .setAlpha(0.3);

    // 当たり判定ゾーン（overlap でプレイヤーに力を伝える）
    this.zone = scene.add.zone(cx, cy, w, h) as ZoneData;
    scene.physics.add.existing(this.zone);
    const body = this.zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;
    this.zone.dir = this.dir;
    this.zone.force = this.baseForce;
    this.zone.currentForce = 0;

    ctx.windZones.push(this.zone);
    ctx.registerUpdatable(this);
    ctx.registerResettable(this);
  }

  update(time: number): void {
    const cycle = this.gustMs + this.calmMs;
    const t = time % cycle;
    const gusting = t < this.gustMs;
    this.zone.currentForce = gusting ? this.baseForce : 0;

    // 見た目: 突風中は矢印を強調＋揺らす
    if (gusting) {
      this.arrows.setAlpha(0.5 + 0.4 * Math.sin(time / 60));
      this.banner.setFillStyle(COLORS.sky, 0.22);
    } else {
      this.arrows.setAlpha(0.25);
      this.banner.setFillStyle(COLORS.sky, 0.08);
    }
  }

  reset(): void {
    this.zone.currentForce = 0;
  }
}
