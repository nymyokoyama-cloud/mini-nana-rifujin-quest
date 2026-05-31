/**
 * config.ts
 * ゲーム全体で使う定数を一元管理するファイル。
 * 画面サイズ・色・物理パラメータ・テクスチャキーなどをここにまとめておくと、
 * あとから調整しやすい。
 */

// --- 画面サイズ -----------------------------------------------------------
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// --- 色パレット（企画書のトーン: 白/ピンク/水色/黄色 + 赤/黒） -------------
export const COLORS = {
  white: 0xffffff,
  pink: 0xff8fc4,
  pinkLight: 0xffd6e8,
  sky: 0x7fd4ff,
  skyLight: 0xcdeeff,
  yellow: 0xffd84d,
  red: 0xff5a5a,
  black: 0x2b2b2b,
  green: 0x66cc66,
  purple: 0xb98bff,
  gray: 0xb9c2cc,
} as const;

// CSS文字列版（テキスト色やUIで使う）
export const CSS = {
  white: "#ffffff",
  pink: "#ff8fc4",
  pinkDeep: "#e85a9b",
  sky: "#7fd4ff",
  yellow: "#ffd84d",
  red: "#ff5a5a",
  black: "#2b2b2b",
  textDark: "#3a2b33",
} as const;

// --- テクスチャキー（画像差し替え時はこことBootSceneを直す） ---------------
export const TEX = {
  // キャラ（実画像）
  nanaFront: "nana_front",
  nanaSide: "nana_side",
  nanaBack: "nana_back",
  // 図形プレースホルダー（BootSceneでgenerateTexture）
  platform: "tex_platform",
  ground: "tex_ground",
  spike: "tex_spike",
  hallucination: "tex_hallucination",
  generating: "tex_generating",
  gate: "tex_gate",
  key: "tex_key",
  swamp: "tex_swamp",
  dashFloor: "tex_dashfloor",
  windZone: "tex_windzone",
  comment: "tex_comment",
  checkpoint: "tex_checkpoint",
  goal: "tex_goal",
  fakeGoal: "tex_fakegoal",
  board: "tex_board",
  particle: "tex_particle",
} as const;

// --- 物理パラメータ（操作感の要。気持ちよさ重視で調整） -------------------
export const PHYSICS = {
  gravityY: 1500, // 重力
  moveSpeed: 235, // 通常の歩行速度
  jumpVelocity: -620, // ジャンプの初速（最高到達点 約128px / 水平到達 約190px）
  jumpCutMultiplier: 0.45, // ボタンを離したときにジャンプを抑える割合（可変ジャンプ）
  maxFallSpeed: 900, // 落下速度の上限
  // 状態異常
  swampSpeedRatio: 0.45, // 沼の中の移動速度倍率
  swampJumpRatio: 0.6, // 沼の中のジャンプ力倍率
  windForce: 380, // アルゴリズムの風の押し戻し加速度
  dashSpeed: 430, // 納期前ダッシュ床の強制速度
};

// --- プレイヤー表示サイズ（スプライトをこの高さに合わせてスケール） --------
export const PLAYER = {
  displayHeight: 64, // 画面上の見た目の高さ(px)
  // 当たり判定（見た目より少し小さめにして理不尽さを減らす）
  bodyWidthRatio: 0.42,
  bodyHeightRatio: 0.92,
};

// --- シーンキー -----------------------------------------------------------
export const SCENES = {
  boot: "BootScene",
  title: "TitleScene",
  game: "GameScene",
  result: "ResultScene",
} as const;
