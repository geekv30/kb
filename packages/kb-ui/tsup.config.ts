import { defineConfig } from 'tsup';
import { copyFile } from 'node:fs/promises';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  onSuccess: async () => {
    await copyFile('src/tokens.css', 'dist/tokens.css');
  },
});
