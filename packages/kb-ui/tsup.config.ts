import { defineConfig } from 'tsup';
import { readFile, writeFile } from 'node:fs/promises';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-router-dom'],
  onSuccess: async () => {
    // Concatenate component-scoped CSS (currently the welcome-tour
    // keyframes) onto the bottom of dist/tokens.css so consumers'
    // single `@import '@test-kb-ui/kb-ui/styles'` line keeps wiring
    // every CSS asset the bundle needs at runtime.
    const tokens = await readFile('src/tokens.css', 'utf8');
    const welcomeTour = await readFile(
      'src/components/overlays/welcome-tour/welcome-tour-animations.css',
      'utf8',
    );
    await writeFile(
      'dist/tokens.css',
      `${tokens}\n/* welcome-tour animations */\n${welcomeTour}`,
    );
  },
});
