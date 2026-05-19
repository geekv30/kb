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
    // Ship tokens.css as the canonical design-tokens CSS export
    // (`@test-kb-ui/kb-ui/styles`). Keep this file scoped to tokens only —
    // component-scoped CSS lives at its own sub-path (see welcome-tour
    // copy below).
    await copyFile('src/tokens.css', 'dist/tokens.css');
    // Component-scoped CSS shipped as its own sub-path. Consumers opt in
    // via `import '@test-kb-ui/kb-ui/welcome-tour.css'`. Storybook (which
    // resolves source) picks up the same keyframes via the
    // `import './welcome-tour-animations.css'` inside WelcomeTourOverlay.
    await copyFile(
      'src/components/overlays/welcome-tour/welcome-tour-animations.css',
      'dist/welcome-tour.css',
    );
  },
});
