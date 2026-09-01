import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_TARGET = 'http://127.0.0.1:3000';
const apiProxy = {
  '/auth': { target: API_TARGET, changeOrigin: true },
  '/animais': { target: API_TARGET, changeOrigin: true },
  '/ongs': { target: API_TARGET, changeOrigin: true },
  '/usuarios': { target: API_TARGET, changeOrigin: true },
  '/health': { target: API_TARGET, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
});
