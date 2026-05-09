import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Default: include every story (local dev shows Review/*).
// When STORYBOOK_PUBLIC=1 (set by the Chromatic workflow), exclude
// Review/* stories — those are internal calibration surfaces
// (FigmaCompare side-by-side review canvas) and shouldn't ship
// in the public Storybook build.
//
// Storybook's stories array does not honour `!` negation entries
// reliably, so we resolve the file list ourselves in a function-form
// `stories` loader and filter out review stories when STORYBOOK_PUBLIC=1.
async function collectStoryFiles(srcDir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(srcDir, {
    withFileTypes: true,
    recursive: true,
  });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    const isStory =
      name.endsWith('.mdx') ||
      name.endsWith('.stories.ts') ||
      name.endsWith('.stories.tsx');
    if (!isStory) continue;
    const parentPath =
      // Node 20+ Dirent.parentPath; fall back to the older `path` field.
      (entry as unknown as { parentPath?: string; path?: string })
        .parentPath ??
      (entry as unknown as { path?: string }).path ??
      srcDir;
    out.push(path.join(parentPath, name));
  }
  return out;
}

const config: StorybookConfig = {
  stories: async () => {
    const srcDir = path.resolve(dirname, '..', 'src');
    const storybookDir = path.resolve(dirname);
    const all = await collectStoryFiles(srcDir);
    const filtered =
      process.env.STORYBOOK_PUBLIC === '1'
        ? all.filter((file) => !file.includes('.review.stories.'))
        : all;
    // Storybook expects entries relative to the .storybook directory.
    return filtered.map(
      (file) => `./${path.relative(storybookDir, file)}`,
    );
  },
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
