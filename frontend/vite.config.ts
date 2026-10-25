import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: path.resolve(process.env.LOCALAPPDATA || __dirname, 'NIRBHAYA', 'vite-cache'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    // Loopback by default. Set NIRBHAYA_DEV_HOST=0.0.0.0 for LAN testing.
    host: process.env.NIRBHAYA_DEV_HOST || '127.0.0.1',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
