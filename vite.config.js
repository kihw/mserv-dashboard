import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

export default defineConfig({
  plugins: [basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/static': path.resolve(__dirname, './static'),
      '/config': path.resolve(__dirname, './config'),
    },
  },
  server: {
    port: 3000,
    open: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    // Serve static files
    fs: {
      allow: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'static'), path.resolve(__dirname, 'config')],
    },
    // Add middleware to serve config files
    middleware: (app) => {
      app.use('/config', (req, res, next) => {
        const filePath = path.resolve(__dirname, 'config', req.url.slice(1));
        res.sendFile(filePath);
      });
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  optimizeDeps: {
    include: ['src/core/*.js', 'src/modules/*.js', 'src/utils/*.js'],
  },
});
