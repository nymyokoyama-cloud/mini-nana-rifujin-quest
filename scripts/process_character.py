#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ミニ奈々ちゃん 三面図 加工スクリプト

入力: IMG_3798.JPG （1024x1024 / 緑背景クロマキー / 正面・横向き・背面の三面図）
出力: public/assets/images/ 配下に透過PNGを3枚生成
  - nana_front.png  正面（待機・ジャンプ・死亡に使用）
  - nana_side.png   横向き（歩行に使用。右向き基準）
  - nana_back.png   背面（予備）

処理内容:
  1. 緑背景をクロマキーで透過（JPG圧縮の緑フチも軽く除去）
  2. 不透明ピクセルの塊から3体を自動分割し、余白をトリムして個別保存

依存: Pillow (PIL)
実行: python3 scripts/process_character.py
"""

import os
from PIL import Image

# --- パス設定 -------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                      # プロジェクトルート
SRC = os.path.join(ROOT, "IMG_3798.JPG")          # 元画像
OUT_DIR = os.path.join(ROOT, "public", "assets", "images")
os.makedirs(OUT_DIR, exist_ok=True)

# --- パラメータ -----------------------------------------------------------
# 緑判定: g が r,b より十分大きく、かつ赤が支配的でない画素を背景とみなす
GREEN_DOMINANCE = 28     # g - max(r,b) がこの値以上なら緑寄り
GREEN_MIN = 70           # g がこの値以上（暗すぎる緑の影は残す方向）
DEFRINGE_PASSES = 1      # 透明画素に隣接する半透明縁を緑抜きする回数


def is_green_bg(r, g, b):
    """背景の緑かどうかを判定する。"""
    # 緑が赤・青より明確に強く、十分に明るい → 背景
    return g >= GREEN_MIN and (g - max(r, b)) >= GREEN_DOMINANCE


def chroma_key(img):
    """緑背景を透過させた RGBA 画像を返す。"""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_green_bg(r, g, b):
                px[x, y] = (r, g, b, 0)
    return img


def defringe(img):
    """縁に残る緑かぶりを軽減する（不透明だが緑が強い縁画素を弱める）。"""
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # 緑が突出している縁画素は、緑成分を赤青の平均近くまで落とす
            if g > r + 18 and g > b + 18:
                cap = max(r, b) + 12
                if g > cap:
                    px[x, y] = (r, cap, b, a)
    return img


def alpha_bbox_columns(img):
    """各列に不透明画素が存在するかの真偽リストを返す（縦方向の塊検出用）。"""
    px = img.load()
    w, h = img.size
    cols = [False] * w
    for x in range(w):
        for y in range(h):
            if px[x, y][3] > 16:
                cols[x] = True
                break
    return cols


def split_figures(img, expected=3, min_width=40, gap=8):
    """
    透明背景の画像から、横に並んだ複数体を列の連続塊として分割する。
    expected 体になるように、細かいギャップは無視してまとめる。
    返り値: 各体の (left, right) 列範囲のリスト（左から順）
    """
    cols = alpha_bbox_columns(img)
    w = len(cols)

    # 連続する不透明列の区間を抽出
    runs = []
    start = None
    for x in range(w):
        if cols[x]:
            if start is None:
                start = x
        else:
            if start is not None:
                runs.append([start, x - 1])
                start = None
    if start is not None:
        runs.append([start, w - 1])

    # 近接する区間（gap 以下の隙間）を結合
    merged = []
    for run in runs:
        if merged and run[0] - merged[-1][1] - 1 <= gap:
            merged[-1][1] = run[1]
        else:
            merged.append(run[:])

    # 幅が狭すぎるノイズ区間を除去
    merged = [m for m in merged if (m[1] - m[0] + 1) >= min_width]

    # expected 体より多い場合は、幅の広い順に expected 個へ絞る
    if len(merged) > expected:
        merged_sorted = sorted(merged, key=lambda m: (m[1] - m[0]), reverse=True)[:expected]
        merged = sorted(merged_sorted, key=lambda m: m[0])

    return merged


def crop_trimmed(img, left, right, pad=6):
    """指定列範囲を切り出し、上下左右の透明余白をトリムして返す。"""
    region = img.crop((left, 0, right + 1, img.height))
    bbox = region.getbbox()  # 不透明領域の境界
    if bbox:
        region = region.crop(bbox)
    # 周囲に少しだけ透明余白を足す（描画時の見切れ防止）
    out = Image.new("RGBA", (region.width + pad * 2, region.height + pad * 2), (0, 0, 0, 0))
    out.paste(region, (pad, pad))
    return out


def main():
    if not os.path.exists(SRC):
        raise SystemExit(f"元画像が見つかりません: {SRC}")

    print(f"読み込み: {SRC}")
    img = Image.open(SRC)
    img = chroma_key(img)
    for _ in range(DEFRINGE_PASSES):
        img = defringe(img)

    figures = split_figures(img, expected=3)
    print(f"検出した体の数: {len(figures)} -> {figures}")

    names = ["nana_front.png", "nana_side.png", "nana_back.png"]
    if len(figures) != 3:
        print("警告: 3体に分割できませんでした。等分割にフォールバックします。")
        w = img.width
        third = w // 3
        figures = [(0, third - 1), (third, 2 * third - 1), (2 * third, w - 1)]

    for (left, right), name in zip(figures, names):
        sprite = crop_trimmed(img, left, right)
        out_path = os.path.join(OUT_DIR, name)
        sprite.save(out_path)
        print(f"保存: {out_path}  ({sprite.width}x{sprite.height})")

    print("完了。")


if __name__ == "__main__":
    main()
