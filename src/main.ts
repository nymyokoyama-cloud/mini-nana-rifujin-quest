/**
 * main.ts
 * Phaser ゲームの起点。シーンを登録して起動する。
 */
import Phaser from "phaser";
import "./style.css";
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, CSS } from "./config";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: CSS.sky,
  pixelArt: false,
  // 画面サイズに合わせて拡大し、中央寄せ
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: PHYSICS.gravityY },
      debug: false, // 当たり判定を見たいときは true
    },
  },
  scene: [BootScene, TitleScene, GameScene, ResultScene],
};

// ゲーム開始
const game = new Phaser.Game(config);

// 開発・デバッグ用にゲームインスタンスを公開しておく（本番でも害はない）
(window as unknown as { __GAME__: Phaser.Game }).__GAME__ = game;
