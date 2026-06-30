import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('assembly PDF import does not seed placeholder images', async () => {
  const source = await readFile(new URL('./import-assembly-pdfs-to-directus.mjs', import.meta.url), 'utf8');

  assert.equal(source.includes('assemblyPlaceholderImage'), false);
  assert.equal(source.includes('Ensamble+PC+Gamer+CDMX'), false);
});
