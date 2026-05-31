import { defineConfig } from "vite";

// GitHub Pages 等のサブパス公開でも動くよう base を相対パスにしておく。
// （ルート直下公開なら "/" でもよいが "./" が最も無難）
export default defineConfig({
  base: "./",
  server: {
    host: true,
    open: false,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
