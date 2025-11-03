import { defineConfig } from 'vite';

// 静态网站配置 - 不进行构建
export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  preview: {
    port: 4173,
    open: true
  },
  build: {
    // 禁用构建 - 这是一个静态网站
    outDir: null,
    assetsDir: null,
    emptyOutDir: false
  }
});
