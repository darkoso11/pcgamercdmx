import { asTrimmedText, normalizeCatalogSlug } from './catalog-form.utils';

describe('catalog form utils', () => {
  it('normalizes catalog slugs consistently', () => {
    expect(normalizeCatalogSlug(' Ensamble Rápido RTX_4070!! ')).toBe('ensamble-rapido-rtx-4070');
  });

  it('returns trimmed text only for string values', () => {
    expect(asTrimmedText('  Producto  ')).toBe('Producto');
    expect(asTrimmedText(null)).toBe('');
    expect(asTrimmedText(123)).toBe('');
  });
});
