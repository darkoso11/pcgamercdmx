import { firstValueFrom } from 'rxjs';

import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('does not expose example assemblies when the backend catalog is disabled', async () => {
    const directus = {
      isEnabled: jasmine.createSpy('isEnabled').and.returnValue(false),
    };
    const service = new ProductsService(directus as any);

    const products = await firstValueFrom(service.getAssembledPCs());

    expect(products).toEqual([]);
  });
});
