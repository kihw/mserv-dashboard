import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
  ],
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
    // Ensure correct path resolution
    fs: {
      allow: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'static'), path.resolve(__dirname, 'config')],
    },
    // Add explicit middleware for static and config files
    middleware: [
      (req, res, next) => {
        // Handle static CSS files
        if (req.url.startsWith('/static/')) {
          const filePath = path.resolve(__dirname, req.url.slice(1));
          return res.sendFile(filePath);
        }
        // Handle config files
        if (req.url.startsWith('/config/')) {
          const filePath = path.resolve(__dirname, req.url.slice(1));
          return res.sendFile(filePath);
        }
        next();
      },
    ],
  },
});