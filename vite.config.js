import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    port: 3000,
    https: false,
    fs: {
      allow: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'static'), path.resolve(__dirname, 'config')],
    },
  },
  // Remove the problematic esbuild configuration
});
