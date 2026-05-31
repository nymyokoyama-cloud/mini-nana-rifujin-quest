/**
 * TitleScene.ts
 * タイトル画面。ゲーム名・ミニ奈々ちゃん・スタート/遊び方/このゲームについて を表示。
 */
import Phaser from "phaser";
import { SCENES, TEX, CSS, COLORS, GAME_WIDTH, GAME_HEIGHT } from "../config";
import { GAME_TITLE, STAGE_NAME, HOW_TO_PLAY, ABOUT } from "../data/texts";
import { loadBest } from "../utils/storage";
import { formatTime } from "../utils/timer";

export class TitleScene extends Phaser.Scene {
  private overlay?: Phaser.GameObjects.Container;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // 背景の淡い帯
    this.add.rectangle(cx, 150, GAME_WIDTH, 220, COLORS.pinkLight, 0.5);

    // タイトル
    this.add
      .text(cx, 90, GAME_TITLE, {
        fontFamily: "sans-serif",
        fontSize: "44px",
        color: CSS.pinkDeep,
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 140, `ステージ1「${STAGE_NAME}」`, {
        fontFamily: "sans-serif",
        fontSize: "20px",
        color: CSS.textDark,
      })
      .setOrigin(0.5);

    // ミニ奈々ちゃん（正面）をふわっと表示
    const nana = this.add.image(cx, 300, TEX.nanaFront).setOrigin(0.5);
    const scale = 200 / nana.height;
    nana.setScale(scale);
    this.tweens.add({
      targets: nana,
      y: 290,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // ベスト記録があれば表示
    const best = loadBest();
    if (best) {
      this.add
        .text(
          cx,
          410,
          `ベスト記録  死亡 ${best.deaths}回 / ${formatTime(best.timeMs)}`,
          {
            fontFamily: "sans-serif",
            fontSize: "16px",
            color: CSS.pinkDeep,
          }
        )
        .setOrigin(0.5);
    }

    // ボタン群
    this.makeButton(cx, 450, "▶ ゲームスタート", COLORS.pink, () => {
      this.scene.start(SCENES.game);
    });
    this.makeButton(cx - 150, 505, "遊び方", COLORS.sky, () => {
      this.showOverlay("遊び方", HOW_TO_PLAY);
    });
    this.makeButton(cx + 150, 505, "このゲームについて", COLORS.yellow, () => {
      this.showOverlay("このゲームについて", ABOUT);
    });
  }

  /** 角丸風のボタンを作る（背景の四角 + テキスト + クリック）。 */
  private makeButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void
  ): void {
    const w = label.length * 16 + 48;
    const bg = this.add
      .rectangle(x, y, w, 44, color)
      .setStrokeStyle(3, COLORS.white)
      .setInteractive({ useHandCursor: true });
    const txt = this.add
      .text(x, y, label, {
        fontFamily: "sans-serif",
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => bg.setScale(1.06));
    bg.on("pointerout", () => bg.setScale(1));
    bg.on("pointerdown", () => {
      bg.setScale(0.96);
    });
    bg.on("pointerup", onClick);
    // テキストもクリック可能領域に含める見た目調整
    txt.setDepth(1);
  }

  /** 「遊び方」「このゲームについて」のオーバーレイを表示。 */
  private showOverlay(title: string, lines: string[]): void {
    if (this.overlay) return;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const container = this.add.container(0, 0).setDepth(100);
    const dim = this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, COLORS.black, 0.55)
      .setInteractive();
    const panel = this.add
      .rectangle(cx, cy, GAME_WIDTH - 160, GAME_HEIGHT - 120, COLORS.white)
      .setStrokeStyle(4, COLORS.pink);
    const head = this.add
      .text(cx, cy - 170, title, {
        fontFamily: "sans-serif",
        fontSize: "28px",
        color: CSS.pinkDeep,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const body = this.add
      .text(cx, cy - 10, lines.join("\n"), {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: CSS.textDark,
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);
    const close = this.add
      .text(cx, cy + 175, "× とじる", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: CSS.pinkDeep,
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    close.on("pointerup", () => this.hideOverlay());
    dim.on("pointerup", () => this.hideOverlay());

    container.add([dim, panel, head, body, close]);
    this.overlay = container;
  }

  private hideOverlay(): void {
    this.overlay?.destroy();
    this.overlay = undefined;
  }
}
