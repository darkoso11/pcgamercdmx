import { buildCatalogCategories, matchesCatalogCategory } from './catalog-categories';
import { ProductCategory } from '../../shared/models';
import { catalogProductType } from './catalog-filters';

describe('Catalog taxonomy', () => {
  const parents = [{ id: 2, slug: 'componentes', published: true }, { id: 3, slug: 'perifericos', published: true }];

  it('shows the same products in Motherboards and the Tarjetas madre type filter', () => {
    const categories = buildCatalogCategories(parents, [
      { id: 30, name: 'Motherboards', slug: 'componentes-tarjeta-madre', category_id: 2, published: true },
      { id: 31, name: 'Asus', slug: 'componentes-asus-tarjeta-madre', category_id: 2, published: true },
      { id: 32, name: 'Asus', slug: 'componentes-asus', category_id: 2, published: true },
    ]);
    const motherboard = categories.find(category => category.slug === 'motherboard')!;
    const products = ['motherboard', '30', '31', 'componentes-asus-tarjeta-madre', '32', 'gpu']
      .map(subcategory => ({ category: ProductCategory.COMPONENT, subcategory }));
    const byType = products.filter(product => catalogProductType(product, categories) === 'motherboard');
    expect(byType.map(product => product.subcategory)).toEqual(['motherboard', '30', '31', 'componentes-asus-tarjeta-madre']);
    expect(products.filter(product => matchesCatalogCategory(product, motherboard))).toEqual(byType);
    expect(matchesCatalogCategory({ category: ProductCategory.PERIPHERAL, subcategory: '31' }, motherboard)).toBeFalse();
    const asus = categories.find(category => category.slug === 'componentes-asus')!;
    expect(asus.values).toContain('31');
    expect(asus.values).toContain('32');
  });

  it('retains each ID type when brand category names are grouped', () => {
    const categories = buildCatalogCategories(parents, [
      { id: 22, name: 'Gigabyte', slug: 'componentes-gigabyte', category_id: 2, published: true },
      { id: 36, name: 'Gigabyte', slug: 'componentes-gigabyte-tarjeta-madre', category_id: 2, published: true },
    ]);
    expect(catalogProductType({ category: ProductCategory.COMPONENT, subcategory: '22' }, categories)).toBeUndefined();
    expect(catalogProductType({ category: ProductCategory.COMPONENT, subcategory: '36' }, categories)).toBe('motherboard');
    expect(catalogProductType({ category: ProductCategory.PERIPHERAL, subcategory: '36' }, categories)).toBeUndefined();
  });

  it('keeps brand canonicals independent of editorial sorting', () => {
    for (const brand of ['amd', 'asus', 'msi', 'gigabyte']) {
      const records = [
        { id: 21, name: brand, slug: `componentes-${brand}`, category_id: 2, published: true, sort: 9 },
        { id: 49, name: brand, slug: `componentes-${brand}-tarjeta-madre`, category_id: 2, published: true, sort: 1 },
      ];
      const before = buildCatalogCategories(parents, records).find(category => category.label.toLowerCase() === brand)!;
      expect(before.slug).toBe(`componentes-${brand}`);
      records[0].sort = 0;
      expect(buildCatalogCategories(parents, records).find(category => category.label.toLowerCase() === brand)!.slug).toBe(before.slug);
      expect(before.aliases).toContain(records[1].slug);
    }
  });

  it('groups equivalent names only within their parent and keeps every ID and slug', () => {
    const categories = buildCatalogCategories(parents, [
      { id: 20, name: 'Accesorios', slug: 'componentes-accesorios', category_id: 2, published: true },
      { id: 29, name: 'Accesorios', slug: 'perifericos-accesorios', category_id: 3, published: true },
      { id: 70, name: ' ACCESÓRIOS ', slug: 'perifericos-otros-accesorios', category_id: 3, published: true },
    ]);
    const groups = categories.filter(category => category.label === 'Accesorios');
    expect(groups.length).toBe(2);
    const peripheral = groups.find(category => category.group === 'perifericos')!;
    expect(peripheral.values).toEqual(['29', 'perifericos-accesorios', '70', 'perifericos-otros-accesorios']);
    expect(matchesCatalogCategory({ category: ProductCategory.PERIPHERAL, subcategory: '70' }, peripheral)).toBeTrue();
    expect(matchesCatalogCategory({ category: ProductCategory.COMPONENT, subcategory: '70' }, peripheral)).toBeFalse();
  });

  it('excludes unpublished records, unknown parents and invalid path slugs', () => {
    const categories = buildCatalogCategories(parents, [
      { id: 80, name: 'Oculta', slug: 'oculta', category_id: 3, published: false },
      { id: 81, name: 'Sin padre', slug: 'sin-padre', category_id: 100, published: true },
      { id: 82, name: 'Ruta inválida', slug: '../invalid', category_id: 3, published: true },
    ]);
    expect(categories.some(category => category.values?.some(value => ['80', '81', '82'].includes(value)))).toBeFalse();
  });

  it('preserves the legacy URL even when a duplicate precedes the seeded record', () => {
    const categories = buildCatalogCategories(parents, [
      { id: 15, name: 'TECLADOS', slug: 'perifericos-teclados', category_id: 3, published: true, sort: 1 },
      { id: 9, name: 'Teclados', slug: 'perifericos-keyboard', category_id: 3, published: true, sort: 9 },
    ]);
    const keyboard = categories.find(category => category.slug === 'keyboard')!;
    expect(keyboard.values).toEqual(['keyboard', '15', 'perifericos-teclados', '9', 'perifericos-keyboard']);
    expect(categories.filter(category => /teclados/i.test(category.label)).length).toBe(1);
  });
});
