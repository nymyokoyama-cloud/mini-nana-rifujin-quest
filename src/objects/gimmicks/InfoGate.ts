/**
 * InfoGate.ts （情報不足ゲート & カギ）
 * 条件（カギ＝情報）を満たさないと開かないゲート。
 * 近くのカギを取ると対応するゲートが開く。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../../config";
import type { StageBuildContext, Resettable } from "../types";
import type { StageObject } from "../../data/stages";

/** ゲート本体。閉じている間は乗れない壁。 */
export class InfoGate implements Resettable {
  private rect: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private originalY: number;
  private opened = false;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const w = obj.w ?? 26;
    const h = obj.h ?? 150;
    const id = obj.params?.gateId ?? "gate";

    const cx = obj.x + w / 2;
    const cy = obj.y + h / 2;
    this.originalY = cy;

    this.rect = scene.add
      .rectangle(cx, cy, w, h, COLORS.purple)
      .setStrokeStyle(3, COLORS.white);
    this.label = scene.add
      .text(cx, obj.y - 14, "情報不足", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: CSS.textDark,
      })
      .setOrigin(0.5);

    // 衝突する壁として登録
    ctx.solids.add(this.rect);

    // GameScene にゲートを登録（カギ取得時に open される）
    ctx.registerGate(id, this);
    // 注意: ゲートは死亡リトライでは元に戻さない（一度開けたら開いたまま）。
    // チェックポイントがゲートより先にある場合に詰むのを防ぐため。
    // ステージを最初からやり直すとき(シーン再生成)は新しく作り直される。
  }

  open(): void {
    if (this.opened) return;
    this.opened = true;
    const body = this.rect.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = false;
    this.label.setText("開いた！");
    this.label.setColor(CSS.pinkDeep);
    // 上にスライドして消える
    this.rect.scene.tweens.add({
      targets: this.rect,
      y: this.rect.y - 180,
      alpha: 0,
      duration: 350,
      ease: "Back.in",
    });
  }

  close(): void {
    this.opened = false;
    const body = this.rect.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = true;
    this.rect.setPosition(this.rect.x, this.originalY);
    this.rect.setAlpha(1);
    this.label.setText("情報不足");
    this.label.setColor(CSS.textDark);
  }

  reset(): void {
    this.close();
  }
}

/** カギ。触れると対応ゲートを開ける（情報＝カギ）。 */
export class GateKey implements Resettable {
  public readonly zone: Phaser.GameObjects.Zone;
  public readonly gateId: string;
  private visual: Phaser.GameObjects.Container;
  private collected = false;

  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    this.gateId = obj.params?.gateId ?? "gate";

    // カギの見た目（丸＋持ち手）。ふわふわ上下する。
    const ring = scene.add.circle(0, 0, 10, COLORS.yellow).setStrokeStyle(3, COLORS.black);
    const teeth = scene.add.rectangle(0, 14, 6, 14, COLORS.yellow).setStrokeStyle(2, COLORS.black);
    this.visual = scene.add.container(obj.x, obj.y - 30, [ring, teeth]);
    scene.tweens.add({
      targets: this.visual,
      y: obj.y - 38,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: "Sine.inOut",
    });

    this.zone = scene.add.zone(obj.x, obj.y - 30, 36, 44);
    scene.physics.add.existing(this.zone);
    const body = this.zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;
    // カギも死亡リトライでは戻さない（取得済みのまま）。
  }

  isCollected(): boolean {
    return this.collected;
  }

  collect(): void {
    if (this.collected) return;
    this.collected = true;
    this.visual.setVisible(false);
    (this.zone.body as Phaser.Physics.Arcade.Body).enable = false;
  }

  reset(): void {
    this.collected = false;
    this.visual.setVisible(true);
    (this.zone.body as Phaser.Physics.Arcade.Body).enable = true;
  }
}
