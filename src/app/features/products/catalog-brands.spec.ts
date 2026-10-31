import { CatalogBrand, resolveRecordBrands } from './catalog-brands';
import { mapDirectusProductToCatalogProduct } from '../../core/services/directus-content.mapper';
import { buildCatalogCategories } from './catalog-categories';

describe('Catalog brand references', () => {
  const brands: CatalogBrand[] = [{ id: '7', name: 'Marca nueva', key: 'marca nueva', logo: 'https://example.com/new.png', aliases: ['Marca anterior'] }];
  it('resolves existing product names without changing specifications or taxonomy', () => {
    const record = { subcategory: 'cpu', specifications: { admin: { brand: 'Marca anterior' }, model: '123' } };
    const resolved = resolveRecordBrands(record, brands);
    expect(resolved.specifications?.['admin']).toEqual({ brand: 'Marca nueva', brandId: '7' });
    expect(resolved.specifications?.['model']).toBe('123');
    expect(resolved.subcategory).toBe('cpu');
    expect(record.specifications.admin.brand).toBe('Marca anterior');
  });
  it('uses current assembly logos even when a catalog snapshot exists', () => {
    const record = { category: 'assembled', brand_logos: [{ brandId: '7', alt: 'Marca anterior', src: 'old.png' }],
      specifications: { catalog: { category: 'assembled', brandLogos: [{ name: 'Marca anterior', logo: 'old.png' }] } } };
    const product = mapDirectusProductToCatalogProduct(resolveRecordBrands(record, brands)) as any;
    expect(product.brandLogos).toEqual([{ name: 'Marca nueva', logo: 'https://example.com/new.png' }]);
  });
  it('uses the current manufacturer for catalog snapshots in every public view', () => {
    const record = { category: 'peripheral', specifications: { admin: { brandId: '7' },
      catalog: { category: 'peripheral', specifications: { brand: 'Marca anterior', connection: 'USB' } } } };
    const product = mapDirectusProductToCatalogProduct(resolveRecordBrands(record, brands)) as any;
    expect(product.specifications.brand).toBe('Marca nueva');
    expect(product.specifications.connection).toBe('USB');
  });
  it('excludes custom brands and their historical names from public categories', () => {
    const categories = buildCatalogCategories([{ id: 2, slug: 'componentes', published: true }], [
      { id: 1, name: 'Marca nueva', slug: 'marca-nueva', category_id: 2, published: true },
      { id: 3, name: 'Marca anterior', slug: 'marca-anterior', category_id: 2, published: true },
    ], brands);
    expect(categories.some(item => item.label.startsWith('Marca'))).toBeFalse();
  });
});
