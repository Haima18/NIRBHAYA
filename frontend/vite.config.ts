import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Only use a local cache dir on Windows dev machines; skip on CI/Vercel.
  ...(process.env.LOCALAPPDATA
    ? { cacheDir: path.resolve(process.env.LOCALAPPDATA, 'NIRBHAYA', 'vite-cache') }
    : {}),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    // Loopback by default. Set NIRBHAYA_DEV_HOST=0.0.0.0 for LAN testing.
    host: process.env.NIRBHAYA_DEV_HOST || '127.0.0.1',
    port: 3000,
    proxy: {
      // In local dev, proxy /api to the Flask backend.
      // On Vercel, /api is handled by the serverless function on the same origin.
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
