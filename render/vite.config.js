// Build config only; the kb's src/ is copied in unchanged. `#lib/…` resolves through package.json "imports".
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ pages: 'build', assets: 'build', strict: false }),
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook } })],
      output: { bundleStrategy: 'single' },
      prerender: { entries: ['*'], handleHttpError: 'warn', handleMissingId: 'warn' },
    }),
  ],
});
