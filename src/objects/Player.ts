/**
 * Player.ts
 * ミニ奈々ちゃん本体。左右移動・可変ジャンプ・状態異常（沼/風/ダッシュ床）を扱う。
 * 見た目は正面画像（待機）と横向き画像（歩行）を切り替える。
 */
import Phaser from "phaser";
import { PHYSICS, PLAYER, TEX } from "../config";
import { GameKeys, isDown, justDown } from "../utils/input";

export class Player extends Phaser.Physics.Arcade.Sprite {
  // 状態異常フラグ（GameScene が毎フレーム書き換える）
  public inSwamp = false;
  public windDir = 0;
  public windForce = 0;
  public forcedDashDir = 0;

  public alive = true;
  private facing: 1 | -1 = 1; // 1=右向き, -1=左向き
  private jumping = false;

  // 当たり判定の基準（最初に確定して以後固定する）
  private bodyW = 0;
  private bodyH = 0;
  private offX = 0;
  private offY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.nanaFront);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 見た目の高さを基準にスケール（正面/横向きは同じ高さ762pxなので倍率が揃う）
    this.setOrigin(0.5, 1); // 足元を基準点にすると地面に立たせやすい
    const scale = PLAYER.displayHeight / this.height;
    this.setScale(scale);

    // 当たり判定を体に合わせて少し小さめに（理不尽さ軽減）
    const frameW = this.width;
    const frameH = this.height;
    this.bodyW = frameW * PLAYER.bodyWidthRatio;
    this.bodyH = frameH * PLAYER.bodyHeightRatio;
    this.offX = (frameW - this.bodyW) / 2;
    this.offY = frameH - this.bodyH;
    this.applyBody();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(99999, PHYSICS.maxFallSpeed);
    body.setCollideWorldBounds(false);
  }

  /** 体の当たり判定を（テクスチャを変えても）一定に保つ。 */
  private applyBody(): void {
    this.setBodySize(this.bodyW, this.bodyH, false);
    this.setOffset(this.offX, this.offY);
  }

  /** 毎フレームの操作処理。 */
  public handleInput(keys: GameKeys): void {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;

    // --- 横移動 ---
    const speed = PHYSICS.moveSpeed * (this.inSwamp ? PHYSICS.swampSpeedRatio : 1);
    let vx = 0;

    if (this.forcedDashDir !== 0) {
      // 納期前ダッシュ床: 強制的に走らされる
      vx = PHYSICS.dashSpeed * this.forcedDashDir;
    } else {
      if (isDown(keys.left)) vx -= speed;
      if (isDown(keys.right)) vx += speed;
    }
    // アルゴリズムの風: 横に押し戻す（入力に加算）
    if (this.windDir !== 0) vx += this.windForce * this.windDir;

    this.setVelocityX(vx);

    // --- 向きと見た目の切り替え ---
    if (vx > 5) this.facing = 1;
    else if (vx < -5) this.facing = -1;
    this.updateAppearance(vx, onGround);

    // --- ジャンプ（可変ジャンプ） ---
    const jv = PHYSICS.jumpVelocity * (this.inSwamp ? PHYSICS.swampJumpRatio : 1);
    if (onGround && justDown(keys.jump)) {
      this.setVelocityY(jv);
      this.jumping = true;
    }
    // ボタンを離したら上昇を弱める（短く押すと低いジャンプ）
    if (this.jumping && !isDown(keys.jump) && body.velocity.y < 0) {
      this.setVelocityY(body.velocity.y * PHYSICS.jumpCutMultiplier);
      this.jumping = false;
    }
    if (onGround) this.jumping = false;
  }

  /** 動きに応じて正面/横向きの画像を切り替える。 */
  private updateAppearance(vx: number, onGround: boolean): void {
    const moving = Math.abs(vx) > 5;
    if (moving) {
      // 横向き画像（元絵は左向きなので、右を向くときは反転）
      if (this.texture.key !== TEX.nanaSide) {
        this.setTexture(TEX.nanaSide);
        this.applyBody();
      }
      this.setFlipX(this.facing === 1);
    } else {
      // 待機は正面
      if (this.texture.key !== TEX.nanaFront) {
        this.setTexture(TEX.nanaFront);
        this.applyBody();
      }
      this.setFlipX(false);
    }
    // 空中はほんの少し傾けて躍動感を出す（任意の演出）
    this.setAngle(onGround ? 0 : this.facing * 4);
  }

  /** 死亡（操作不能にする。演出と復活は GameScene 側で行う）。 */
  public kill(): void {
    this.alive = false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    this.setVisible(false);
  }

  /** 指定位置で復活。 */
  public respawn(x: number, y: number): void {
    this.alive = true;
    this.inSwamp = false;
    this.windDir = 0;
    this.forcedDashDir = 0;
    this.jumping = false;
    this.facing = 1;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    this.setVisible(true);
    this.setTexture(TEX.nanaFront);
    this.applyBody();
    this.setFlipX(false);
    this.setAngle(0);
    this.setPosition(x, y);
    body.setVelocity(0, 0);
  }
}
