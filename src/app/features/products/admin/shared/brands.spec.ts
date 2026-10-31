import { firstValueFrom } from 'rxjs';
import { ProductsAdminService } from './products-admin.service';

describe('Shared brand registry', () => {
  const service = () => new ProductsAdminService({ isEnabled: () => false } as any) as any;

  it('creates a reusable brand and rejects normalized duplicates', async () => {
    const api = service();
    const created = await firstValueFrom<any>(api.saveBrand({ name: '  Marca Nueva  ', logo: '' }));
    expect(created.name).toBe('Marca Nueva');
    expect((await firstValueFrom<any[]>(api.getBrands())).some(item => item.id === created.id)).toBeTrue();
    await expectAsync(firstValueFrom(api.saveBrand({ name: 'MÁRCA   NUEVA', logo: '' }))).toBeRejected();
  });

  it('retains identity and old names when renaming', async () => {
    const api = service();
    const created = await firstValueFrom<any>(api.saveBrand({ name: 'Marca Antigua', logo: 'assets/logo.png' }));
    const edited = await firstValueFrom<any>(api.saveBrand({ ...created, name: 'Marca Actual' }));
    expect(edited.id).toBe(created.id);
    expect(edited.aliases).toContain('Marca Antigua');
    await expectAsync(firstValueFrom(api.saveBrand({ name: 'Marca Antigua', logo: '' }))).toBeRejected();
  });

  it('excludes registered brands from admin taxonomy without modifying stored categories', async () => {
    const api = service();
    await firstValueFrom(api.saveBrand({ name: 'Fabricante Nuevo', logo: '' }));
    api.mockCategories = [{ _id: '2', name: 'Componentes', slug: 'componentes', order: 1,
      subcategories: [{ _id: 'a', name: 'Fabricante Nuevo', slug: 'fabricante-nuevo' },
        { _id: 'b', name: 'Procesadores', slug: 'componentes-procesadores' }] }];
    const categories = await firstValueFrom<any[]>(api.getAllCategories());
    expect(categories[0].subcategories.map((item: any) => item.name)).toEqual(['Procesadores']);
    expect(api.mockCategories[0].subcategories.length).toBe(2);
    await expectAsync(firstValueFrom(api.addSubcategory('2', { name: 'Fabricante Nuevo', slug: 'fabricante' }))).toBeRejected();
  });
});
