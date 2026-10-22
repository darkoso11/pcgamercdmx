import { ProductCategory } from '../../shared/models';
import type { DirectusCategoryRecord, DirectusSubcategoryRecord } from '../../core/services/directus-content.mapper';
import { catalogTypeForSlug } from './catalog-types';
import { normalizeCatalogText } from './catalog-filters';

export interface CatalogCategory {
  slug: string;
  label: string;
  group: 'perifericos' | 'hardware-accesorios';
  categories: ProductCategory[];
  values?: string[];
  aliases?: string[];
  typeValues?: Record<string, string[]>;
}

// Existing public type filters and model slugs. Membership is an exact
// subcategory match; opaque CMS IDs must never be guessed from product names.
export const CATALOG_CATEGORIES: CatalogCategory[] = [
  ...[
    ['monitor', 'Monitores'], ['keyboard', 'Teclados'], ['mouse', 'Mouse'],
    ['headset', 'Headsets'], ['speaker', 'Bocinas'], ['chair', 'Sillas'],
    ['controller', 'Mandos'], ['microphone', 'Micrófonos'], ['camera', 'Cámaras'],
    ['mousepad', 'Mousepads'],
  ].map(([slug, label]): CatalogCategory => ({
    slug, label, group: 'perifericos', categories: [ProductCategory.PERIPHERAL],
  })),
  ...[
    ['cpu', 'CPU'], ['gpu', 'GPU'], ['ram', 'RAM'], ['storage', 'Almacenamiento'],
    ['motherboard', 'Motherboards'], ['power-supply', 'Fuentes'],
    ['cooling', 'Enfriamiento'], ['case', 'Gabinetes'],
    ['cable', 'Cables'], ['usb-hub', 'Adaptadores y hubs'],
  ].map(([slug, label]): CatalogCategory => ({
    slug, label, group: 'hardware-accesorios',
    categories: [ProductCategory.COMPONENT, ProductCategory.ACCESSORY],
  })),
];

export const catalogCategoryPath = (category: CatalogCategory): string =>
  `productos/${category.group}/${category.slug}`;

const displayName = (value: string): string => value.replace(/&amp;/g, '&').trim();

export function buildCatalogCategories(parents: DirectusCategoryRecord[], records: DirectusSubcategoryRecord[]): CatalogCategory[] {
  const result = CATALOG_CATEGORIES.map(category => ({ ...category, values: [category.slug], aliases: [category.slug],
    typeValues: { [category.slug]: [category.slug] } as Record<string, string[]> }));
  const names = new Map(result.map(category => [`${category.group}:${normalizeCatalogText(category.label)}`, category]));
  // These exact aliases are defined by tools/directus-seed-from-mocks.mjs.
  const seededTypes = new Set(['cpu', 'gpu', 'ram', 'storage', 'keyboard', 'mouse', 'monitor', 'headset']);
  const published = records.filter(record => record.published === true && record.id !== undefined && record.name &&
    record.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug));
  const rows = published.map(record => {
    const parent = parents.find(item => item.published === true &&
      (record.category_id != null ? String(item.id) === String(record.category_id) : item.slug === record.category_slug));
    const group: CatalogCategory['group'] | null = parent?.slug === 'perifericos' ? 'perifericos' : parent?.slug === 'componentes' ? 'hardware-accesorios' : null;
    return { record, parent, group };
  }).filter(row => row.group !== null);
  rows.sort((a, b) => (Number(a.record.sort ?? 999) - Number(b.record.sort ?? 999)) ||
    String(a.record.id).localeCompare(String(b.record.id), 'en', { numeric: true }));

  // Register seeded names first so duplicate CMS names join their established URL,
  // even if a duplicate sorts before the seeded record.
  for (const { record, parent, group } of rows) {
    const legacy = result.find(category => category.group === group && seededTypes.has(category.slug) &&
      record.slug === `${parent!.slug}-${category.slug}`);
    if (legacy) names.set(`${group}:${normalizeCatalogText(displayName(record.name!))}`, legacy);
  }
  for (const { record, group } of rows) {
    const label = displayName(record.name!);
    const key = `${group}:${normalizeCatalogText(label)}`;
    let category = names.get(key);
    if (!category) {
      category = { slug: record.slug!, label, group: group!,
        categories: group === 'perifericos' ? [ProductCategory.PERIPHERAL] : [ProductCategory.COMPONENT, ProductCategory.ACCESSORY],
        values: [], aliases: [], typeValues: {},
      };
      result.push(category);
      names.set(key, category);
    }
    category.values.push(String(record.id), record.slug!);
    category.aliases.push(record.slug!);
    const type = catalogTypeForSlug(record.slug!);
    if (type) (category.typeValues[type] ??= []).push(String(record.id), record.slug!);
  }
  // The Motherboards chip shares the explicit type membership of Tarjetas madre,
  // including IDs assigned to brand-specific motherboard categories.
  const motherboard = result.find(category => category.slug === 'motherboard')!;
  motherboard.values = result
    .filter(category => category.group === motherboard.group)
    .flatMap(category => category.typeValues['motherboard'] ?? []);
  return result.map(category => {
    if (!CATALOG_CATEGORIES.some(legacy => legacy.group === category.group && legacy.slug === category.slug)) {
      const preferred = `componentes-${normalizeCatalogText(category.label)}`;
      const stableRow = rows.filter(({ record }) => category.values.includes(String(record.id)))
        .sort((a, b) => String(a.record.id).localeCompare(String(b.record.id), 'en', { numeric: true }))[0];
      category.slug = category.aliases.includes(preferred) ? preferred : stableRow?.record.slug ?? category.slug;
    }
    return { ...category, values: [...new Set(category.values)], aliases: [...new Set(category.aliases)] };
  });
}

export function matchesCatalogCategory(product: { category: ProductCategory; subcategory: string }, category: CatalogCategory): boolean {
  return category.categories.includes(product.category) && (category.values ?? [category.slug]).includes(product.subcategory);
}
