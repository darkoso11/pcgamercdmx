import type { ProductCategory } from '../../shared/models';
import type { CatalogCategory } from './catalog-categories';

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export const normalizeCatalogText = (value: string): string => value.normalize('NFD')
  .replace(/\p{M}/gu, '').trim().toLocaleLowerCase('es').replace(/\s+/g, ' ');

export function catalogProductBrand(product: { specifications?: unknown }): string {
  const specs = record(product.specifications);
  const admin = record(specs['admin']);
  const catalog = record(record(specs['catalog'])['specifications']);
  const value = [admin['brand'], specs['brand'], catalog['brand']]
    .find(candidate => typeof candidate === 'string' && candidate.trim() &&
      !['otro', 'otros', 'sin marca', 'no especificado'].includes(normalizeCatalogText(candidate)));
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function catalogProductType(product: { category: ProductCategory; subcategory: string }, categories: CatalogCategory[]): string | undefined {
  for (const category of categories) {
    if (!category.categories.includes(product.category)) continue;
    const type = Object.entries(category.typeValues ?? {}).find(([, values]) => values.includes(product.subcategory));
    if (type) return type[0];
  }
  return undefined;
}
