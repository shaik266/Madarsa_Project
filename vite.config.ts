import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, '.', 'VITE_').VITE_BASE_PATH || '/',
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
