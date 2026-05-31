/**
 * deathMessages.ts
 * 死亡時に表示するネタメッセージ集。
 * ギミックごとの専用メッセージと、汎用のランダムメッセージを用意する。
 */

// ギミック由来の死に対応する専用メッセージ（reason キーで引く）
export const GIMMICK_DEATH_MESSAGES: Record<string, string> = {
  hallucination: "その床、実はハルシネーションだったよ",
  generating: "まだ生成中だったみたい",
  infoGate: "情報が足りなくてAIが迷っちゃった",
  wind: "アルゴリズムの気まぐれに流されたよ",
  comment: "コメント欄が荒れちゃった",
  deadline: "納期前は止まれないよ",
  easyPath: "やさしいって書いてあったのにね",
  swamp: "プロンプトが長すぎて沈んじゃった",
  fall: "あれ？足場がなかったみたい",
  spike: "今のはちょっと理不尽だったね",
};

// 汎用ランダムメッセージ（reasonに対応が無いときに使う）
export const RANDOM_DEATH_MESSAGES: string[] = [
  "今のはちょっと理不尽だったね",
  "一旦深呼吸してリトライだよ",
  "でも、次はきっといけるよ",
  "やさしい道ほど疑った方がいいかも",
  "生成が完了する前に乗っちゃったね",
  "アルゴリズムの風、強すぎたね",
];

/** reason に対応するメッセージを返す。無ければランダム。 */
export function getDeathMessage(reason?: string): string {
  if (reason && GIMMICK_DEATH_MESSAGES[reason]) {
    return GIMMICK_DEATH_MESSAGES[reason];
  }
  const i = Math.floor(Math.random() * RANDOM_DEATH_MESSAGES.length);
  return RANDOM_DEATH_MESSAGES[i];
}
