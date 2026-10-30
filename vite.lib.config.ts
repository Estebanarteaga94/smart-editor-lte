import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    lib: {
      entry: new URL('./src/lib.ts', import.meta.url).pathname,
      formats: ['es'],
      fileName: 'smart-editor-lte',
      cssFileName: 'smart-editor-lte',
    },
  },
});
