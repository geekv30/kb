// Emits `dist/styles.d.ts` — a side-effect-only type stub for the
// `@hiver/kb-ui/styles` subpath. Kept out of `tsup.config.ts` because
// tsup's DTS rollup runs in a worker thread and would race with us.
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '..', 'dist');
const target = resolve(distDir, 'styles.d.ts');

const STYLES_DTS = `// Type declaration stub for the side-effect-only \`@hiver/kb-ui/styles\` subpath.
// The actual artifact is \`dist/tokens.css\` (CSS variables / @theme tokens) — this
// file exists so strict-TS consumers can do \`import '@hiver/kb-ui/styles';\`
// without hitting TS2882. There are no runtime exports.
export {};
`;

await mkdir(distDir, { recursive: true });
await writeFile(target, STYLES_DTS);
