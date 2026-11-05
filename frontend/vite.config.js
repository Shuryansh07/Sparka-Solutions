import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // Catalyst Slate's local serve injects ZC_SLATE_PORT via `--port`.
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_DEV_API_TARGET || 'http://localhost:9000', changeOrigin: true },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
