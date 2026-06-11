# 引き継ぎ・運用ガイド（ミニ奈々ちゃんと理不尽クエスト）

> このファイルは、ゲームの編集・管理・公開を引き継ぐための「全部入り」ドキュメントです。
> AIアシスタント（Codex 等）も人も、これを読めば運用できます。

---

## 0. これは何のプロジェクト？

- **ゲーム名**: ミニ奈々ちゃんと理不尽クエスト
- **種類**: ブラウザで動く高難度2Dアクション（ネタ系・覚えゲー）
- **構成**: Vite + TypeScript + Phaser 3。1ステージ「はじめての理不尽」に8ギミックを収録。
- **バージョン**: v0.1（MVP公開済み）

---

## 1. 場所・URL 一覧（最重要）

| 種別 | 値 |
|---|---|
| **ローカル作業フォルダ（唯一の編集場所）** | `/Users/user/Documents/ゲーム/ミニ奈々ちゃんと理不尽クエスト` |
| **GitHub リポジトリ** | https://github.com/nymyokoyama-cloud/mini-nana-rifujin-quest |
| **メインブランチ** | `main` |
| **公開URL（本番・Cloudflare Pages）** | `https://mini-nana-quest.pages.dev` |
| **ローカル確認用URL** | `http://localhost:5173/`（`npm run dev` 実行時） |

> ⚠️ 作業コピーは**この1フォルダだけ**にしてください。別の場所にクローンして二重管理しないこと。

---

## 2. 技術スタック / 必要環境

| 項目 | 値 |
|---|---|
| ランタイム | Node.js 20 以上（`.nvmrc` で 20 を指定） |
| パッケージ管理 | npm |
| ビルドツール | Vite 6 |
| 言語 | TypeScript 5 |
| ゲームエンジン | **Phaser 3.90**（※Phaser 4 ではない。APIが違うので上げないこと） |
| 画像加工 | Python 3 + Pillow（キャラ画像の前処理のみ） |

---

## 3. ローカルでの動かし方

```bash
# 作業フォルダへ移動
cd "/Users/user/Documents/ゲーム/ミニ奈々ちゃんと理不尽クエスト"

npm install      # 初回のみ（依存パッケージの取得）
npm run dev      # 開発サーバー起動 → http://localhost:5173/ をブラウザで開く
npm run build    # 本番ビルド（型チェック + dist/ 生成）。push前にこれが通るか必ず確認
npm run preview  # ビルド結果をローカルで確認
```

- `npm run build` は `tsc --noEmit && vite build`。**型エラーがあるとビルドが落ちる**ので、push前に必ず通すこと。

---

## 4. フォルダ構成と「どこを触ると何が変わるか」

```
ミニ奈々ちゃんと理不尽クエスト/
├─ HANDOFF.md            ← このファイル
├─ README.md             ← 遊び方・公開方法など一般向け
├─ IMG_3798.JPG          ← キャラ三面図（元画像・加工の元ネタ）
├─ index.html            ← エントリHTML
├─ package.json          ← 依存・スクリプト定義
├─ vite.config.ts        ← Vite設定（base: "./" → どのホストでもそのまま動く）
├─ tsconfig.json         ← TypeScript設定
├─ .nvmrc                ← Cloudflareビルド用 Nodeバージョン(20)
├─ scripts/
│   └─ process_character.py   ← 三面図の緑背景透過＆切り出し（Python/Pillow）
├─ public/assets/
│   ├─ images/           ← 加工済みスプライト(nana_front/side/back.png)。差し替え可
│   └─ sounds/           ← 効果音/BGM置き場（現状空）
└─ src/
    ├─ main.ts           ← ゲーム起動・シーン登録
    ├─ config.ts         ← ★画面サイズ・色・物理パラメータ・テクスチャキー（調整の起点）
    ├─ style.css         ← ページ全体のCSS
    ├─ scenes/
    │   ├─ BootScene.ts      ← 画像読み込み・初期化
    │   ├─ TitleScene.ts     ← タイトル画面
    │   ├─ GameScene.ts      ← ★本体（ステージ構築・物理・死亡/復活・HUD・クリア判定）
    │   └─ ResultScene.ts    ← クリア画面（評価・タイム・SNS共有文）
    ├─ objects/
    │   ├─ Player.ts         ← ★プレイヤー（移動・ジャンプ・状態異常）
    │   ├─ Platform.ts / Trap.ts / Checkpoint.ts / Goal.ts / MessageBoard.ts / MessageBox.ts
    │   └─ gimmicks/         ← ★8ギミック（1ファイル1ギミック）
    │       ├─ HallucinationFloor.ts  （消える床）
    │       ├─ GeneratingPlatform.ts  （生成中足場）
    │       ├─ InfoGate.ts            （情報不足ゲート＋カギ）
    │       ├─ AlgorithmWind.ts       （風）
    │       ├─ FlameComment.ts        （炎上コメント弾）
    │       ├─ DeadlineDashFloor.ts   （ダッシュ床）
    │       ├─ PromptSwamp.ts         （沼）
    │       └─ EasyPath.ts            （やさしい道＝隠れトゲ）
    └─ data/
        ├─ stages.ts        ← ★ステージ配置データ（ここを編集＝レベル変更）
        ├─ deathMessages.ts ← 死亡メッセージ
        └─ texts.ts         ← セリフ・評価ランク・UI文言
```

### よくある編集タスク → 触る場所
| やりたいこと | 編集するファイル |
|---|---|
| ステージの足場/罠/ギミックの配置を変える | `src/data/stages.ts` |
| 難易度（ジャンプ力・速度・重力）を調整 | `src/config.ts` の `PHYSICS` |
| 色やキャラ表示サイズを変える | `src/config.ts` の `COLORS` / `PLAYER` |
| 死亡メッセージ・ネタを追加 | `src/data/deathMessages.ts` |
| セリフ・クリア評価を変える | `src/data/texts.ts` |
| 新しいギミックを追加 | `src/objects/gimmicks/` に新クラス → `GameScene.ts` の `buildObject()` に分岐追加 → `stages.ts` に配置 |
| 新ステージを追加 | `src/data/stages.ts` に `StageData` を追記（`STAGES` 配列に追加） |
| キャラ画像を差し替え | 下の「5. キャラ画像」参照 |

---

## 5. キャラ画像の加工パイプライン

ミニ奈々ちゃんの絵は、緑背景の三面図 `IMG_3798.JPG` を加工して使っています。

```bash
python3 scripts/process_character.py
# → public/assets/images/ に nana_front.png / nana_side.png / nana_back.png を生成
#   （緑背景を透過し、正面・横向き・背面を自動で切り出す）
```

- **絵を差し替えたい**：`IMG_3798.JPG` を新しい三面図（緑背景）に置き換えて上記を再実行。
- 画像のテクスチャ名は `src/config.ts` の `TEX` に集約。画像差し替え時はここを見れば対応関係が分かる。

---

## 6. ゲーム設計の重要ルール（変更時に壊しやすい注意点）

- **ジャンプ性能（実測値）**: 最高到達 約128px / 水平到達 約190px。
  → ステージの**谷は最大130px・段差は最大70px**に収めること（超えると到達不能になる）。値は `config.ts` の `PHYSICS`。
- **当たり判定**は見た目より少し小さめ（理不尽さ軽減）。`config.ts` の `PLAYER.bodyWidthRatio/bodyHeightRatio`。
- **落下死**: プレイヤーの y が `stages.ts` の `deathY`（=640）を超えたら死亡。谷＝即死。
- **チェックポイント**: 触れると復活地点が更新。難所の手前に必ず置くこと。
- **カギ／ゲートは「取得したら永続」**：死亡リトライでは元に戻さない設計（`InfoGate.ts` は `registerResettable` していない）。
  チェックポイントがゲートより先にあると詰むため、この仕様は外さないこと。ステージを最初からやり直す（シーン再生成）と新規生成されてリセットされる。
- **ハルシネーション床/生成中足場/風/コメント弾**は死亡時にリセットされる（各クラスが `registerResettable`）。
- **炎上コメント弾**は発射元から左へ流れる。射程は `FlameComment.ts` の `range`(=340)。長くすると手前のセクションに弾が届いて理不尽になる。

---

## 7. 更新 → 公開の流れ（これが運用の中心）

```
① コード修正（src/ や stages.ts などを編集）
② npm run build が通るか確認（型エラーがないか）
③ GitHub Desktop で「Commit to main」→「Push origin」
④ Cloudflare Pages が push を検知して自動ビルド＆デプロイ（1〜2分）
⑤ 公開URL（*.pages.dev）が最新版に更新される
```

- **コマンド派**なら `git add -A && git commit -m "..." && git push` でも同じ。
- 反映されない時は **ブラウザを強制リロード（Cmd+Shift+R）**。キャッシュのことが多い。

---

## 8. デプロイ設定の詳細

### 本番：Cloudflare Pages（現用・これが本命）
GitHubリポジトリと連携済み。`main` への push で自動デプロイ。

| 設定項目 | 値 |
|---|---|
| Production branch | `main` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node バージョン | `.nvmrc` で 20 を指定済み |

- 管理画面: Cloudflare ダッシュボード → **Workers & Pages** → 該当プロジェクト → **Deployments** でビルド状況を確認。
- ビルド失敗時はそこのログにエラーが出る。だいたい型エラーかビルド設定。

### 補助：GitHub Actions → GitHub Pages（任意・現状は未使用想定）
`.github/workflows/deploy.yml` があり、push時に GitHub Pages へもデプロイしようとします。
URLに個人名が入る（`nymyokoyama-cloud.github.io/...`）ため、**本番はCloudflareを使用**。
GitHub Pages を使わないなら、リポジトリ Settings → Pages の Source を「None」にするか、
このワークフローファイルを削除してOK（Cloudflare運用には不要）。

---

## 9. 動作確認・トラブルシュート

| 症状 | 対処 |
|---|---|
| 変更が公開URLに反映されない | Cmd+Shift+R で強制リロード／Cloudflareの Deployments が Success か確認 |
| Cloudflareビルドが失敗 | ログのエラーを確認。ローカルで `npm run build` を通してから push し直す |
| ローカルで真っ白 | ブラウザの開発者ツール Console を確認。`npm run dev` のターミナルのエラーも見る |
| キャラが表示されない | `public/assets/images/*.png` があるか、`scripts/process_character.py` を実行したか確認 |
| 型エラーで build が落ちる | エラーメッセージのファイル/行を直す。`npx tsc --noEmit` で型だけチェック可 |

> デバッグ用: `main.ts` で `window.__GAME__` にPhaserのゲームを公開している。ブラウザのConsoleから
> `window.__GAME__.scene.getScene('GameScene')` で内部状態を見られる（開発用・無害）。

---

## 10. Codex（引き継ぎAI）への注意点

- **編集対象は `src/` と `src/data/` が中心**。`dist/` と `node_modules/` は自動生成物なので触らない（gitignore済み）。
- 変更したら必ず `npm run build` を通す（型エラーゼロが公開の前提）。
- **ジャンプで届く範囲（谷≤130px・段差≤70px）を厳守**。超えるとクリア不能になる。
- カギ/ゲートの「永続」仕様、チェックポイント位置、コメント弾の射程は、フェアさを保つ要。むやみに変えない。
- ステージは**データ駆動**（`stages.ts`）。新ステージ・新ギミックは既存の型とファクトリ（`GameScene.buildObject`）に沿って追加する。
- 公開は「push → Cloudflare 自動デプロイ」。デプロイ操作自体は不要（push するだけ）。

---

## 11. 今後の拡張アイデア（v0.2 以降）

ステージ追加 / BGM・効果音（`public/assets/sounds/`）/ ミニ奈々ちゃんの表情差分 / ボスステージ /
ステージ選択 / ランキング風表示 / SNS共有ボタン連携 / スマホ対応 / チュートリアル / 隠しステージ。

---

## 12. ライセンス・素材について

- キャラ以外（足場・罠・UI）はコード内で描画した図形のプレースホルダー。すべてオリジナル。
- ミニ奈々ちゃんの画像の権利は制作者に帰属。
- 実況・配信は歓迎（README参照）。
