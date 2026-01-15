import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.mjs'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['frontend/**/*.js'],
      exclude: [
        'node_modules/',
        'tests/',
        'prototypes/',
        '**/*.test.mjs',
        '**/*.spec.mjs'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend')
    }
  }
});
