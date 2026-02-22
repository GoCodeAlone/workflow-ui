import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'api/index': resolve(__dirname, 'src/api/index.ts'),
        'auth/index': resolve(__dirname, 'src/auth/index.ts'),
        'sse/index': resolve(__dirname, 'src/sse/index.ts'),
        'theme/index': resolve(__dirname, 'src/theme/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'zustand'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
