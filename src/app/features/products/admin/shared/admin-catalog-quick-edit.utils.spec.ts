import { Product } from './products-admin.service';
import {
  buildCatalogQuickEditPatch,
  createCatalogQuickEditDraft,
  isCatalogQuickEditDirty,
  resetCatalogQuickEditDraft,
  reconcileCatalogQuickEditDrafts,
  validateCatalogQuickEditDraft,
} from './admin-catalog-quick-edit.utils';

describe('admin catalog quick edit utilities', () => {
  const product = (overrides: Partial<Product> = {}): Product => ({
    _id: 'product-1',
    title: 'RTX 5070',
    slug: 'rtx-5070',
    description: 'Tarjeta gráfica',
    category: 'componentes',
    price: 14999,
    image: '',
    images: [],
    brandLogos: [],
    stock: 8,
    lowStockAlert: 3,
    published: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

  it('preserves a dirty field and refreshes untouched fields after another row changes', () => {
    const draft = createCatalogQuickEditDraft(product());
    draft.price = 12000;
    const result = reconcileCatalogQuickEditDrafts([product({ stock: 4 })], new Map([['product-1', draft]]));
    expect(result.get('product-1')).toBe(draft);
    expect(draft.price).toBe(12000);
    expect(draft.stock).toBe(4);
    expect(buildCatalogQuickEditPatch(draft)).toEqual({ price: 12000 });
  });

  it('preserves a pending save object during reload', () => {
    const draft = createCatalogQuickEditDraft(product());
    draft.stock = 2;
    draft.saving = true;
    const result = reconcileCatalogQuickEditDrafts([product()], new Map([['product-1', draft]]));
    expect(result.get('product-1')).toBe(draft);
    expect(draft.saving).toBeTrue();
    expect(draft.stock).toBe(2);
  });

  it('warns on concurrent changes and discards to the latest server values', () => {
    const draft = createCatalogQuickEditDraft(product());
    draft.price = 12000;
    reconcileCatalogQuickEditDrafts([product({ price: 13000 })], new Map([['product-1', draft]]));
    expect(draft.price).toBe(12000);
    expect(draft.original.price).toBe(13000);
    expect(draft.messageType).toBe('error');
    expect(draft.message).toContain('servidor');
    resetCatalogQuickEditDraft(draft);
    expect(draft.price).toBe(13000);
  });

  it('adds new records and removes deleted records', () => {
    const result = reconcileCatalogQuickEditDrafts([product({ _id: 'new' })], new Map([['old', createCatalogQuickEditDraft(product())]]));
    expect(result.has('old')).toBeFalse();
    expect(result.has('new')).toBeTrue();
  });

  it('creates an independent draft from the confirmed catalog values', () => {
    const item = product();

    const draft = createCatalogQuickEditDraft(item);
    draft.price = 12000;

    expect(draft.original).toEqual({ price: 14999, stock: 8, published: true });
    expect(item.price).toBe(14999);
  });

  it('detects changes in each editable field', () => {
    const priceDraft = createCatalogQuickEditDraft(product());
    const stockDraft = createCatalogQuickEditDraft(product());
    const publishedDraft = createCatalogQuickEditDraft(product());
    priceDraft.price = 14000;
    stockDraft.stock = 4;
    publishedDraft.published = false;

    expect(isCatalogQuickEditDirty(createCatalogQuickEditDraft(product()))).toBeFalse();
    expect(isCatalogQuickEditDirty(priceDraft)).toBeTrue();
    expect(isCatalogQuickEditDirty(stockDraft)).toBeTrue();
    expect(isCatalogQuickEditDirty(publishedDraft)).toBeTrue();
  });

  it('builds a patch containing only changed values', () => {
    const draft = createCatalogQuickEditDraft(product());
    draft.stock = 2;
    draft.published = false;

    expect(buildCatalogQuickEditPatch(draft)).toEqual({ stock: 2, published: false });
  });

  it('accepts zero and prices with at most two decimals', () => {
    const draft = createCatalogQuickEditDraft(product());
    draft.price = 0;
    draft.stock = 0;

    expect(validateCatalogQuickEditDraft(draft)).toEqual({});

    draft.price = 199.99;
    expect(validateCatalogQuickEditDraft(draft)).toEqual({});
  });

  it('rejects invalid prices with a deterministic message', () => {
    const draft = createCatalogQuickEditDraft(product());

    draft.price = -1;
    expect(validateCatalogQuickEditDraft(draft).price).toBe(
      'Ingresa un precio válido con máximo dos decimales.'
    );

    draft.price = 10.999;
    expect(validateCatalogQuickEditDraft(draft).price).toBe(
      'Ingresa un precio válido con máximo dos decimales.'
    );

    draft.price = Number.NaN;
    expect(validateCatalogQuickEditDraft(draft).price).toBe(
      'Ingresa un precio válido con máximo dos decimales.'
    );
  });

  it('rejects negative or fractional stock', () => {
    const draft = createCatalogQuickEditDraft(product());

    draft.stock = -1;
    expect(validateCatalogQuickEditDraft(draft).stock).toBe(
      'Ingresa una cantidad de stock entera y no negativa.'
    );

    draft.stock = 1.5;
    expect(validateCatalogQuickEditDraft(draft).stock).toBe(
      'Ingresa una cantidad de stock entera y no negativa.'
    );
  });

  it('restores the confirmed values when a draft is discarded', () => {
    const draft = createCatalogQuickEditDraft(product());
    draft.price = 1;
    draft.stock = 0;
    draft.published = false;
    draft.message = 'No se pudo guardar';

    resetCatalogQuickEditDraft(draft);

    expect(draft.price).toBe(14999);
    expect(draft.stock).toBe(8);
    expect(draft.published).toBeTrue();
    expect(draft.message).toBe('');
    expect(isCatalogQuickEditDirty(draft)).toBeFalse();
  });
});
