/**
 * stages.ts
 * ステージのデータ定義。コードにベタ書きせず、ここのデータを増やすだけで
 * 新しいステージを作れるようにしている。
 *
 * 座標の約束:
 *  - 四角い要素 (ground/platform/spike/hallucination/generating/gate/swamp/dashFloor/wind)
 *    → x,y は「左上」、w,h はサイズ。
 *  - 点の要素 (checkpoint/goal/fakeGoal/key/board/commentSpawner)
 *    → x,y はその要素の代表位置（おおむね地面の上に立つ足元）。
 *
 * ワールドは横に長く、カメラがプレイヤーを追う。
 * 地面より下（y が大きい）に落ちると落下死。
 */

// ステージ要素の種類
export type StageObjectType =
  | "ground" // 普通の地面（安全）
  | "platform" // 普通の足場（安全）
  | "spike" // 即死トラップ（とげ）
  | "hallucination" // ハルシネーション床（近づく/乗ると消える）
  | "generating" // 生成中足場（点滅して出たり消えたり）
  | "gate" // 情報不足ゲート（カギで開く）
  | "key" // ゲートを開けるカギ
  | "swamp" // プロンプト沼（移動/ジャンプ低下）
  | "dashFloor" // 納期前ダッシュ床（強制的に走らされる）
  | "easyPath" // やさしい道（安全そうな平らな道＋隠れトゲ）
  | "wind" // アルゴリズムの風（横に押し戻す）
  | "commentSpawner" // 炎上コメント弾の発射元
  | "checkpoint" // チェックポイント
  | "goal" // 本物のゴール
  | "fakeGoal" // 偽ゴール（触れてもクリアにならない）
  | "board"; // 看板（メッセージ表示）

export interface StageObject {
  type: StageObjectType;
  x: number;
  y: number;
  w?: number;
  h?: number;
  // 種類ごとの追加パラメータ
  params?: {
    text?: string; // board/comment などの表示文字
    gateId?: string; // gate と key の対応付け
    force?: number; // wind の強さ
    dir?: number; // 向き(-1=左, +1=右)
    onMs?: number; // generating: 表示している時間
    offMs?: number; // generating: 消えている時間
    offsetMs?: number; // generating: 位相ずらし
    trigger?: "proximity" | "step"; // hallucination の消えるきっかけ
    intervalMs?: number; // commentSpawner: 発射間隔
    speed?: number; // commentSpawner: 弾速
    texts?: string[]; // commentSpawner: 弾に乗せる文字候補
    spikes?: number[]; // easyPath: トゲを置くx相対位置
  };
}

export interface StageData {
  name: string;
  worldWidth: number;
  worldHeight: number;
  spawn: { x: number; y: number }; // プレイヤー初期位置（足元）
  deathY: number; // これより下に落ちたら落下死
  objects: StageObject[];
}

// 地面の上面のy（基準線）
const G = 500;

// 炎上コメントに乗せる文字（短く・煽りすぎない範囲のネタ）
const COMMENT_TEXTS = ["それ違う", "古くない？", "で、結論は？", "知ってた", "ソースは？"];

/**
 * ステージ1「はじめての理不尽」
 * 企画書20章の流れに沿って、8ギミックを順番に体験できる構成。
 */
export const STAGE_FIRST: StageData = {
  name: "はじめての理不尽",
  worldWidth: 4600,
  worldHeight: 540,
  spawn: { x: 70, y: G - 10 },
  deathY: 640,
  objects: [
    // 【設計メモ】ジャンプ性能: 最高到達 約128px / 水平到達 約194px。
    // よって 横の谷は最大130px、登りの段差は最大70px に収め、必ず届くようにしている。

    // ===== セクション1: スタート（広い安全地帯） =====
    { type: "ground", x: 0, y: G, w: 760, h: 40 },
    { type: "board", x: 120, y: G, params: { text: "まずはここからだよ" } },
    { type: "board", x: 640, y: G, params: { text: "初心者向け♪ こっちが近道だよ" } },

    // ===== セクション2: やさしい道（EasyPath：平らだけど少しトゲ） =====
    // トゲは間隔をあけてあるので、ひとつずつジャンプで飛び越えられる。
    { type: "easyPath", x: 760, y: G, w: 420, h: 40, params: { spikes: [250] } },
    // この先のハルシネーション床で失敗してもすぐ戻れるよう、谷の手前にチェックポイント。
    { type: "checkpoint", x: 1130, y: G },

    // ===== セクション3: ハルシネーション床（どれが本物？） =====
    // 本物の床は地続き＆同じ高さ（段差なし）。「?」付きはニセ床（踏む/近づくと消える）。
    // 本物だけを使い、ニセは飛び越える。本物どうしの谷は120pxでちゃんと届く。
    { type: "platform", x: 1180, y: G, w: 140, h: 40 }, // 本物1（easyPathと地続き・段差なし）
    { type: "hallucination", x: 1360, y: G, w: 70, h: 40, params: { trigger: "step" } }, // ニセA（手前の誘い・踏むと抜ける）
    { type: "platform", x: 1440, y: G, w: 140, h: 40 }, // 本物2（本物1から120pxでニセAを飛び越える）
    { type: "hallucination", x: 1620, y: G, w: 70, h: 40, params: { trigger: "proximity" } }, // ニセB（近づくと消える）

    // ===== セクション4: チェックポイント =====
    { type: "ground", x: 1700, y: G, w: 420, h: 40 }, // 本物2から120pxでニセBを飛び越えて着地
    { type: "checkpoint", x: 1760, y: G },
    { type: "board", x: 2000, y: G, params: { text: "ここまで来たの、かなりすごいよ" } },

    // ===== セクション5: 生成中足場（出てる間に渡る・間隔は狭め） =====
    // 表示2.0秒 / 消え0.7秒。ほとんど出ているので、消えた瞬間だけ避ければOK。
    { type: "generating", x: 2170, y: G, w: 120, h: 40, params: { onMs: 3000, offMs: 450, offsetMs: 0 } },
    { type: "generating", x: 2350, y: G, w: 120, h: 40, params: { onMs: 3000, offMs: 450, offsetMs: 1500 } },
    { type: "generating", x: 2530, y: G, w: 120, h: 40, params: { onMs: 3000, offMs: 450, offsetMs: 800 } },

    // ===== セクション6: 風ゾーン + カギ =====
    { type: "ground", x: 2700, y: G, w: 620, h: 40 },
    { type: "checkpoint", x: 2740, y: G },
    { type: "board", x: 2800, y: G, params: { text: "風が強いから踏ん張ってね" } },
    { type: "wind", x: 2860, y: G - 200, w: 260, h: 200, params: { force: 220, dir: -1 } },
    // カギ（地面の上に落ちている）: これを取らないと先のゲートが開かない
    { type: "key", x: 3185, y: G, params: { gateId: "gateA", text: "カギ" } },

    // ===== セクション7: プロンプト沼 =====
    { type: "ground", x: 3320, y: G, w: 380, h: 40 },
    { type: "board", x: 3360, y: G, params: { text: "プロンプトは短めがいいみたい" } },
    { type: "swamp", x: 3380, y: G - 60, w: 150, h: 60 },

    // ===== セクション8: 納期前ダッシュ床（強制的に走らされる） =====
    // 地続きなので落下死はなし。勢いよく右へ走らされる演出ギミック。
    { type: "dashFloor", x: 3580, y: G - 4, w: 120, h: 8, params: { dir: 1 } },
    { type: "board", x: 3540, y: G, params: { text: "ここから先は止まれないよ！" } },
    { type: "ground", x: 3700, y: G, w: 800, h: 40 }, // ダッシュ床から地続き
    { type: "checkpoint", x: 3800, y: G },

    // ===== セクション9: 情報不足ゲート =====
    { type: "gate", x: 3880, y: G - 150, w: 26, h: 150, params: { gateId: "gateA" } },
    { type: "board", x: 3840, y: G, params: { text: "カギを取るとゲートが開くよ" } },

    // ===== セクション10: 炎上コメント弾を避ける（高めの1本） =====
    // 弾は頭の上を飛ぶので、歩いて進めば当たらない（ジャンプすると当たる）。
    // 発射元はゴール手前。弾は左へ流れるのでゴール台には来ない。
    { type: "commentSpawner", x: 4120, y: G - 90, params: { intervalMs: 2400, speed: 170, dir: -1, texts: COMMENT_TEXTS } },
    { type: "board", x: 3980, y: G, params: { text: "コメント弾は上を飛ぶよ。ジャンプ厳禁！" } },

    // ===== セクション11: 偽ゴールと隠しルートの本物ゴール =====
    // 隠しルート: ゴール手前で60px上の足場に登ると本物ゴールがある。
    { type: "platform", x: 4200, y: G - 60, w: 120, h: 20 },
    { type: "goal", x: 4250, y: G - 60 }, // 本物ゴール（上の隠しルート）
    // 偽ゴール: 地面のまっすぐ先。触れてもクリアにならない
    { type: "fakeGoal", x: 4400, y: G },
    { type: "board", x: 4360, y: G, params: { text: "やさしいゴール → こっち（？）" } },
  ],
};

// 将来ステージを増やすときはここに追加するだけ
export const STAGES: StageData[] = [STAGE_FIRST];
