/**
 * ResultScene.ts
 * クリア画面。死亡回数・クリアタイム・評価・SNS共有用テキストを表示する。
 */
import Phaser from "phaser";
import { SCENES, TEX, CSS, COLORS, GAME_WIDTH, GAME_HEIGHT } from "../config";
import { GAME_TITLE, HASHTAG, getRank } from "../data/texts";
import { formatTime } from "../utils/timer";
import { saveIfBest } from "../utils/storage";

export interface ResultData {
  deaths: number;
  timeMs: number;
}

export class ResultScene extends Phaser.Scene {
  private deaths = 0;
  private timeMs = 0;

  constructor() {
    super(SCENES.result);
  }

  init(data: ResultData): void {
    this.deaths = data.deaths ?? 0;
    this.timeMs = data.timeMs ?? 0;
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const isBest = saveIfBest({ deaths: this.deaths, timeMs: this.timeMs });
    const rank = getRank(this.deaths);
    const timeStr = formatTime(this.timeMs);

    // 背景（お祝いっぽい色）
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.pinkLight, 0.6);

    // クリアメッセージ
    this.add
      .text(cx, 70, `${GAME_TITLE}\nクリア！`, {
        fontFamily: "sans-serif",
        fontSize: "40px",
        color: CSS.pinkDeep,
        fontStyle: "bold",
        align: "center",
        stroke: "#ffffff",
        strokeThickness: 8,
        lineSpacing: 4,
      })
      .setOrigin(0.5);

    // ミニ奈々ちゃん（正面）
    const nana = this.add.image(GAME_WIDTH - 140, 320, TEX.nanaFront);
    nana.setScale(190 / nana.height);

    // 成績パネル
    const lines = [
      `死亡回数 :  ${this.deaths} 回`,
      `クリアタイム :  ${timeStr}`,
      `評価 :  ${rank}`,
    ];
    this.add
      .text(120, 180, lines.join("\n"), {
        fontFamily: "sans-serif",
        fontSize: "26px",
        color: CSS.textDark,
        lineSpacing: 14,
      })
      .setOrigin(0, 0);

    if (isBest) {
      this.add
        .text(120, 160, "★ ベスト更新！", {
          fontFamily: "sans-serif",
          fontSize: "20px",
          color: CSS.red,
          fontStyle: "bold",
        })
        .setOrigin(0, 1);
    }

    // SNS共有用テキスト
    const shareText =
      `${GAME_TITLE}をクリア！\n` +
      `死亡回数：${this.deaths}回\n` +
      `クリアタイム：${timeStr}\n` +
      `${HASHTAG}`;

    this.add
      .text(120, 330, "▼ SNS共有用テキスト", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: CSS.pinkDeep,
      })
      .setOrigin(0, 0);

    const box = this.add
      .rectangle(120, 360, 480, 110, COLORS.white)
      .setOrigin(0, 0)
      .setStrokeStyle(2, COLORS.pink);
    this.add
      .text(box.x + 12, box.y + 10, shareText, {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: CSS.textDark,
        lineSpacing: 4,
      })
      .setOrigin(0, 0);

    // コピーボタン
    this.makeButton(360, 500, "📋 コピー", COLORS.sky, () => {
      this.copyToClipboard(shareText);
    });
    // もう一度遊ぶ
    this.makeButton(560, 500, "🔁 もう一度遊ぶ", COLORS.pink, () => {
      this.scene.start(SCENES.game);
    });
    // タイトルへ
    this.makeButton(760, 500, "タイトルへ", COLORS.yellow, () => {
      this.scene.start(SCENES.title);
    });
  }

  private copyToClipboard(text: string): void {
    const done = () => this.flashToast("コピーしたよ！");
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done, () => this.fallbackCopy(text, done));
      } else {
        this.fallbackCopy(text, done);
      }
    } catch {
      this.fallbackCopy(text, done);
    }
  }

  private fallbackCopy(text: string, done: () => void): void {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      this.flashToast("コピーできなかったみたい…");
    }
    document.body.removeChild(ta);
  }

  private flashToast(msg: string): void {
    const t = this.add
      .text(GAME_WIDTH / 2, 540 - 30, msg, {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: CSS.pinkDeep,
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(50);
    this.tweens.add({
      targets: t,
      alpha: 0,
      y: t.y - 20,
      duration: 1200,
      onComplete: () => t.destroy(),
    });
  }

  private makeButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void
  ): void {
    const w = label.length * 15 + 36;
    const bg = this.add
      .rectangle(x, y, w, 42, color)
      .setStrokeStyle(3, COLORS.white)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    bg.on("pointerover", () => bg.setScale(1.06));
    bg.on("pointerout", () => bg.setScale(1));
    bg.on("pointerup", onClick);
  }
}
