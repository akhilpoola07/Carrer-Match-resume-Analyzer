import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (mode === 'production') {
    if (!env.VITE_API_URL) {
      throw new Error('VITE_API_URL must be configured for a production build.');
    }
    let apiUrl: URL;
    try {
      apiUrl = new URL(env.VITE_API_URL);
    } catch {
      throw new Error('VITE_API_URL must be an absolute HTTPS URL for a production build.');
    }
    if (apiUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(apiUrl.hostname)) {
      throw new Error('Production VITE_API_URL must use HTTPS and cannot point to a local address.');
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
