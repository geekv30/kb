import { defineConfig } from 'tsup';

export default defineConfig({
  // The bin entrypoint plus the standalone indexers.
  // The indexers aren't re-exported from `src/index.ts` yet (tools wire up in #9);
  // listing them here keeps them importable as `dist/index/*.js` for smoke tests.
  entry: [
    'src/index.ts',
    'src/index/component-index.ts',
    'src/index/token-index.ts',
  ],
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  // Only the bin entry needs the shebang — adding it to the indexer modules
  // would break ESM imports. tsup applies the banner to every entry, so we
  // strip the shebang from non-bin outputs in a postbuild step rather than
  // here. Simpler: keep the banner only for the bin file by post-processing
  // is overkill — Node tolerates a leading `#!` line in any ESM module when
  // imported (it's treated like a comment), so leave the banner global.
  banner: {
    js: '#!/usr/bin/env node',
  },
});
