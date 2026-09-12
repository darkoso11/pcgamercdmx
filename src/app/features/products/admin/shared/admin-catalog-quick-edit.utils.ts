import { Product } from './products-admin.service';

export interface CatalogQuickEditValues {
  price: number;
  stock: number;
  published: boolean;
}

export interface CatalogQuickEditDraft extends CatalogQuickEditValues {
  original: CatalogQuickEditValues;
  saving: boolean;
  message: string;
  messageType: 'success' | 'error' | '';
  errors: Partial<Record<'price' | 'stock', string>>;
}

export function createCatalogQuickEditDraft(product: Product): CatalogQuickEditDraft {
  const original = valuesFromProduct(product);

  return {
    ...original,
    original,
    saving: false,
    message: '',
    messageType: '',
    errors: {},
  };
}

export function isCatalogQuickEditDirty(draft: CatalogQuickEditDraft): boolean {
  return draft.price !== draft.original.price
    || draft.stock !== draft.original.stock
    || draft.published !== draft.original.published;
}

export function reconcileCatalogQuickEditDrafts(
  products: Product[],
  previous: Map<string, CatalogQuickEditDraft>
): Map<string, CatalogQuickEditDraft> {
  const next = new Map<string, CatalogQuickEditDraft>();
  for (const product of products) {
    if (!product._id) continue;
    const draft = previous.get(product._id);
    if (!draft) {
      next.set(product._id, createCatalogQuickEditDraft(product));
      continue;
    }
    next.set(product._id, draft);
    // Keep the same object while its request owns the pending values.
    if (draft.saving) continue;
    let conflict = false;
    for (const field of ['price', 'stock', 'published'] as const) {
      const dirty = draft[field] !== draft.original[field];
      if (dirty) {
        conflict ||= product[field] !== draft.original[field] && product[field] !== draft[field];
      } else if (field === 'published') {
        draft.published = product.published;
      } else {
        draft[field] = product[field];
      }
    }
    draft.original = valuesFromProduct(product);
    if (conflict) {
      draft.message = 'El servidor cambió campos que estás editando. Conservamos tu entrada: guarda para aplicarla o descarta para usar el valor del servidor.';
      draft.messageType = 'error';
    }
  }
  return next;
}

export function beginCatalogQuickEditSave(draft: CatalogQuickEditDraft): boolean {
  if (draft.saving || !isCatalogQuickEditDirty(draft)) return false;
  draft.errors = validateCatalogQuickEditDraft(draft);
  draft.message = '';
  draft.messageType = '';
  if (Object.keys(draft.errors).length) return false;
  draft.saving = true;
  return true;
}

export function confirmCatalogQuickEditSave(product: Product): CatalogQuickEditDraft {
  const draft = createCatalogQuickEditDraft(product);
  draft.message = 'Cambios guardados.';
  draft.messageType = 'success';
  return draft;
}

export function failCatalogQuickEditSave(draft: CatalogQuickEditDraft): void {
  draft.saving = false;
  draft.message = 'No se pudieron guardar los cambios. Intenta de nuevo.';
  draft.messageType = 'error';
}

export function validateCatalogQuickEditDraft(
  draft: CatalogQuickEditDraft
): CatalogQuickEditDraft['errors'] {
  const errors: CatalogQuickEditDraft['errors'] = {};

  if (!isValidPrice(draft.price)) {
    errors.price = 'Ingresa un precio válido con máximo dos decimales.';
  }

  if (!Number.isFinite(draft.stock) || !Number.isInteger(draft.stock) || draft.stock < 0) {
    errors.stock = 'Ingresa una cantidad de stock entera y no negativa.';
  }

  return errors;
}

export function buildCatalogQuickEditPatch(
  draft: CatalogQuickEditDraft
): Pick<Partial<Product>, 'price' | 'stock' | 'published'> {
  const patch: Pick<Partial<Product>, 'price' | 'stock' | 'published'> = {};

  if (draft.price !== draft.original.price) patch.price = draft.price;
  if (draft.stock !== draft.original.stock) patch.stock = draft.stock;
  if (draft.published !== draft.original.published) patch.published = draft.published;

  return patch;
}

export function resetCatalogQuickEditDraft(draft: CatalogQuickEditDraft): void {
  draft.price = draft.original.price;
  draft.stock = draft.original.stock;
  draft.published = draft.original.published;
  draft.saving = false;
  draft.message = '';
  draft.messageType = '';
  draft.errors = {};
}

function valuesFromProduct(product: Product): CatalogQuickEditValues {
  return {
    price: product.price,
    stock: product.stock,
    published: product.published,
  };
}

function isValidPrice(price: number): boolean {
  return Number.isFinite(price)
    && price >= 0
    && Math.abs(price * 100 - Math.round(price * 100)) < 1e-8;
}
