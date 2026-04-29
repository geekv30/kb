import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite config for the @test-kb-ui/kb-demo app.
//
// Tailwind v4 is wired through `@tailwindcss/vite` — the same way
// `packages/kb-ui` wires it (see `packages/kb-ui/.storybook/main.ts`).
// Keeping the plugin identical here ensures `@test-kb-ui/kb-ui/styles` resolves
// the same token surface in both environments.
//
// `manualChunks` splits the heavy transitive deps (Tiptap and Recharts)
// into their own bundles so the initial route doesn't pay for them.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          tiptap: ['@tiptap/react', '@tiptap/starter-kit'],
          recharts: ['recharts'],
        },
      },
    },
  },
});
