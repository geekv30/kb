import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite config for the legacy Help Center admin replica (app.hiverkb.com).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { sourcemap: true },
});
