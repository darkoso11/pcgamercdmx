import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTaxonomyReference } from './blog-taxonomy.mjs';

test('keeps an id that already belongs to the blog taxonomy', () => {
  const result = resolveTaxonomyReference(
    '1',
    [{ id: 1, name: 'Guias', slug: 'guias' }],
    [{ id: 1, name: 'Ensambles', slug: 'ensambles' }]
  );

  assert.deepEqual(result, {
    alreadyMigrated: true,
    item: { id: 1, name: 'Guias', slug: 'guias' },
    name: 'Guias',
  });
});

test('resolves a legacy id only when it is absent from the blog taxonomy', () => {
  const result = resolveTaxonomyReference(
    '3',
    [{ id: 1, name: 'Guias', slug: 'guias' }],
    [{ id: 3, name: 'Perifericos', slug: 'perifericos' }]
  );

  assert.deepEqual(result, {
    alreadyMigrated: false,
    item: null,
    name: 'Perifericos',
  });
});
