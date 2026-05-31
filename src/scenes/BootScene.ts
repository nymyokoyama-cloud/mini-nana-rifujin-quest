/**
 * BootScene.ts
 * 最初に動くシーン。アセット（ミニ奈々ちゃんの画像）を読み込み、
 * 死亡演出用の小さなテクスチャを生成してから、タイトルへ移る。
 */
import Phaser from "phaser";
import { SCENES, TEX, CSS } from "../config";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  preload(): void {
    // 読み込み中の簡単な表示
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, "よみこみ中…", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        color: CSS.pinkDeep,
      })
      .setOrigin(0.5);

    // ミニ奈々ちゃんのスプライト（緑背景を抜いた加工済みPNG）
    // 画像を差し替えたいときは public/assets/images の中身を入れ替えるだけ。
    this.load.image(TEX.nanaFront, "assets/images/nana_front.png");
    this.load.image(TEX.nanaSide, "assets/images/nana_side.png");
    this.load.image(TEX.nanaBack, "assets/images/nana_back.png");
  }

  create(): void {
    // 死亡演出のキラキラ用パーティクル（小さな白い円）を動的生成
    this.makeParticleTexture();

    this.scene.start(SCENES.title);
  }

  /** 死亡時に飛び散る小さな円のテクスチャを作る。 */
  private makeParticleTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture(TEX.particle, 12, 12);
    g.destroy();
  }
}
