// Simple TypeScript loader for Node.js
import { readFileSync } from 'fs';
import { transformSync } from 'esbuild';

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.tsx') || url.endsWith('.ts')) {
    const source = readFileSync(new URL(url), 'utf8');
    const { code } = transformSync(source, {
      loader: url.endsWith('.tsx') ? 'tsx' : 'ts',
      format: 'esm',
      target: 'node18',
      jsx: 'automatic',
      jsxImportSource: 'hono/jsx'
    });
    return {
      format: 'module',
      source: code,
    };
  }
  return defaultLoad(url, context, defaultLoad);
}