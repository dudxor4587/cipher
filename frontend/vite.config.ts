import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.BACKEND_URL ?? 'http://localhost:8080';

  return {
    plugins: [react()],
    // sockjs-client 가 브라우저에 없는 node 전역 `global` 을 참조 → globalThis 로 매핑
    define: {
      global: 'globalThis',
    },
    server: {
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        '/ws': { target: backend, changeOrigin: true, ws: true },
      },
    },
  };
});
