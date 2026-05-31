/**
 * FlameComment.ts （炎上コメント弾）
 * 画面外からコメント風の弾が飛んでくる。弾には短い煽り文字が乗っている。
 * 触れると即死。リズムを覚えてすり抜ける。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import type { StageBuildContext, Updatable, Resettable } from "../types";
import type { StageObject } from "../../data/stages";

interface Bullet {
  zone: Phaser.GameObjects.Zone;
  bubble: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

export class FlameComment implements Updatable, Resettable {
  private ctx: StageBuildContext;
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private speed: number;
  private dir: number;
  private intervalMs: number;
  private texts: string[];

  private bullets: Bullet[] = [];
  private lastFire = 0;
  private despawnX: number;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    this.ctx = ctx;
    this.scene = ctx.scene;
    this.x = obj.x;
    this.y = obj.y;
    this.speed = obj.params?.speed ?? 300;
    this.dir = obj.params?.dir ?? -1;
    this.intervalMs = obj.params?.intervalMs ?? 1500;
    this.texts = obj.params?.texts ?? ["それ違う", "で、結論は？"];
    // 弾が流れる範囲（ゴール手前のコメント地帯だけに収める。
    // 遠くまで飛ばすと前のセクションまで弾が届いて理不尽になるため短めにする）
    const range = 340;
    this.despawnX = this.dir < 0 ? this.x - range : this.x + range;

    ctx.registerUpdatable(this);
    ctx.registerResettable(this);
  }

  update(time: number, _delta: number): void {
    // 一定間隔で発射
    if (time - this.lastFire >= this.intervalMs) {
      this.lastFire = time;
      this.fire();
    }
    // 弾とラベルの位置同期＆掃除
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.bubble.x = b.zone.x;
      b.bubble.y = b.zone.y;
      b.text.x = b.zone.x;
      b.text.y = b.zone.y;
      const gone = this.dir < 0 ? b.zone.x < this.despawnX : b.zone.x > this.despawnX;
      if (gone) {
        this.destroyBullet(b);
        this.bullets.splice(i, 1);
      }
    }
  }

  private fire(): void {
    const msg = this.texts[Math.floor(Math.random() * this.texts.length)];
    const w = msg.length * 15 + 20;
    const h = 30;

    // 吹き出し（見た目）
    const bubble = this.scene.add
      .rectangle(this.x, this.y, w, h, COLORS.red, 0.92)
      .setStrokeStyle(2, COLORS.white);
    const text = this.scene.add
      .text(this.x, this.y, msg, {
        fontFamily: "sans-serif",
        fontSize: "15px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // 当たり判定ゾーン（少し小さめ）。グループに追加して動的ボディを得る。
    const zone = this.scene.add.zone(this.x, this.y, w - 8, h - 6);
    this.ctx.traps.add(zone);
    const body = zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(this.speed * this.dir);
    zone.setData("reason", "comment");

    this.bullets.push({ zone, bubble, text });
  }

  private destroyBullet(b: Bullet): void {
    b.zone.destroy();
    b.bubble.destroy();
    b.text.destroy();
  }

  reset(): void {
    // リトライ時は飛んでいる弾を全部片付ける
    for (const b of this.bullets) this.destroyBullet(b);
    this.bullets = [];
    this.lastFire = 0;
  }
}
