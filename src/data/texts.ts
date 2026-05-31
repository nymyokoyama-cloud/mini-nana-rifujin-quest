/**
 * texts.ts
 * ミニ奈々ちゃんのセリフ・UIテキスト集。
 * やさしい女の子口調で統一する。
 */

export const GAME_TITLE = "ミニ奈々ちゃんと理不尽クエスト";
export const STAGE_NAME = "はじめての理不尽";
export const HASHTAG = "#ミニ奈々ちゃんと理不尽クエスト";

// タイトル画面の説明文
export const HOW_TO_PLAY = [
  "ミニ奈々ちゃんを操作してゴールを目指そう！",
  "",
  "移動 : ← →  または  A D",
  "ジャンプ : Space / W / ↑",
  "リトライ : R",
  "ポーズ : Esc",
  "",
  "この先、ちょっと理不尽かも。",
  "でも、覚えればきっとクリアできるよ。",
];

export const ABOUT = [
  "このゲームは、ミニ奈々ちゃんが",
  "「理不尽クエスト」に挑戦する高難度アクションだよ。",
  "",
  "AIあるある・発信あるあるをネタにした",
  "意地悪だけど笑えるトラップがいっぱい。",
  "",
  "何度も死にながら、タイミングと観察で",
  "突破していってね。実況・配信は大歓迎！",
];

// ステージ中の看板に表示するミニ奈々ちゃんのひとこと
export const BOARD_TEXTS = {
  start: "まずはここからだよ",
  beginner: "初心者向け♪ こっちが近道だよ",
  hallucination: "その床、ちゃんと在る…はず？",
  generating: "生成が終わるのを待つのも大事だよ",
  wind: "風が強いから踏ん張ってね",
  swamp: "プロンプトは短めがいいみたい",
  deadline: "ここから先は止まれないよ！",
  gate: "カギを取るとゲートが開くよ",
  comment: "コメント弾に気をつけて！",
  fakeGoal: "やさしいゴール → こっち",
  hint: "ほんとのゴールは、すぐ手前にあるのかも？",
};

// クリア評価（死亡回数で分岐）
export function getRank(deaths: number): string {
  if (deaths <= 10) return "AIマスター級";
  if (deaths <= 50) return "かなり使いこなしてるね";
  if (deaths <= 100) return "理不尽に慣れてきたね";
  return "でも最後までやったの、えらいよ";
}
