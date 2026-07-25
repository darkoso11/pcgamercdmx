import { getAdminProductCategoryLabel } from './admin-product-display.utils';
import { Category, Product } from './products-admin.service';

describe('admin product display utilities', () => {
  const categories: Category[] = [
    {
      _id: '2',
      name: 'Componentes',
      slug: 'componentes',
      order: 2,
      subcategories: [
        { _id: '13', name: 'Memorias RAM', slug: 'memorias-ram' },
      ],
    },
  ];

  it('prefers the selected subcategory name', () => {
    const product = {
      category: 'componentes',
      categoryId: '2',
      subcategoryId: '13',
    } as Product;

    expect(getAdminProductCategoryLabel(product, categories)).toBe('Memorias RAM');
  });

  it('uses the selected category when no subcategory matches', () => {
    const product = {
      category: 'componentes',
      categoryId: '2',
    } as Product;

    expect(getAdminProductCategoryLabel(product, categories)).toBe('Componentes');
  });

  it('uses canonical labels when the hierarchy is unavailable', () => {
    expect(getAdminProductCategoryLabel({ category: 'paquetes' } as Product, []))
      .toBe('Ensambles');
    expect(getAdminProductCategoryLabel({ category: 'perifericos' } as Product, []))
      .toBe('Periféricos');
    expect(getAdminProductCategoryLabel({ category: 'componentes' } as Product, []))
      .toBe('Componentes');
  });
});
