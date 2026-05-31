/**
 * MessageBoard.ts
 * ステージ内に立つ看板。ミニ奈々ちゃんのヒントやネタを表示する（装飾のみ）。
 */
import Phaser from "phaser";
import { COLORS, CSS } from "../config";
import type { StageBuildContext } from "./types";
import type { StageObject } from "../data/stages";

export class MessageBoard {
  constructor(ctx: StageBuildContext, obj: StageObject) {
    const scene = ctx.scene;
    const text = obj.params?.text ?? "";

    // 文字幅に合わせて看板サイズを決める
    const boardW = Math.max(120, text.length * 15 + 24);
    const boardH = 46;
    const boardCx = obj.x;
    const boardTop = obj.y - 120;

    // 支柱
    scene.add
      .rectangle(boardCx, obj.y - 50, 8, 80, 0x8a5a2b)
      .setOrigin(0.5, 0.5);
    // 板
    scene.add
      .rectangle(boardCx, boardTop + boardH / 2, boardW, boardH, COLORS.white)
      .setStrokeStyle(3, COLORS.sky);
    // テキスト
    scene.add
      .text(boardCx, boardTop + boardH / 2, text, {
        fontFamily: "sans-serif",
        fontSize: "15px",
        color: CSS.textDark,
        align: "center",
        wordWrap: { width: boardW - 16 },
      })
      .setOrigin(0.5);
  }
}
