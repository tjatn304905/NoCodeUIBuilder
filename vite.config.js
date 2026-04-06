import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// ★ 실제 백엔드 주소로 변경하세요
const BACKEND_ORIGIN = "http://localhost:8080";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vue: "vue/dist/vue.esm-bundler.js"
    }
  },
  server: {
    proxy: {
      // /online/tapl/* 로 시작하는 모든 요청 → 백엔드로 전달 (CORS 우회)
      "/online/tapl": {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
      },
    },
  },
});
