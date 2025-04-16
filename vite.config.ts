import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'xlsx'], // 同时排除 xlsx
  },
  assetsInclude: ['**/*.xlsx'], // 将 .xlsx 文件视为静态资源
  build: {
    assetsInlineLimit: 0, // 确保 Excel 文件不会被内联为 base64
    rollupOptions: {
      external: ['xlsx'], // 关键：将 xlsx 标记为外部依赖
    },
  },
});
