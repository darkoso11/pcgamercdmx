import { catalogProductBrand } from './catalog-filters';

describe('Catalog brand data', () => {
  it('does not treat placeholder labels as manufacturers', () => {
    expect(catalogProductBrand({ specifications: { admin: { brand: 'Otro' } } })).toBe('');
    expect(catalogProductBrand({ specifications: { brand: '  Sin marca ' } })).toBe('');
    expect(catalogProductBrand({ specifications: { admin: { brand: 'Otro' }, brand: 'Asus' } })).toBe('Asus');
  });

  it('uses explicit admin data before a snapshot and tolerates missing specifications', () => {
    expect(catalogProductBrand({ specifications: { admin: { brand: ' MSI ' }, catalog: { specifications: { brand: 'Asus' } } } })).toBe('MSI');
    expect(catalogProductBrand({})).toBe('');
  });
});
