import defaultBrands from './default-brands.json';
import type { DirectusProductRecord } from '../../core/services/directus-content.mapper';
import { catalogProductBrand, normalizeCatalogText } from './catalog-filters';

export interface CatalogBrand {
  id: string;
  name: string;
  key: string;
  logo: string;
  aliases: string[];
}

// Shared with the schema bootstrap; new brands belong in pc_brands, never here.
export const DEFAULT_BRANDS: CatalogBrand[] = defaultBrands.map(({name, logo, aliases}) => ({ id: `legacy-${normalizeCatalogText(name)}`, name,
  key: normalizeCatalogText(name), logo, aliases }));

export function brandMatches(brand: CatalogBrand, name: string): boolean {
  const key = normalizeCatalogText(name);
  return [brand.name, ...(brand.aliases ?? [])].some(alias => normalizeCatalogText(alias) === key);
}

export function isBrandName(name: string, brands: CatalogBrand[] = DEFAULT_BRANDS): boolean {
  return [...DEFAULT_BRANDS, ...brands].some(brand => brandMatches(brand, name));
}

/** Resolve stable IDs first, then exact historical names. Never guess from a title. */
export function resolveRecordBrands(record: DirectusProductRecord, brands: CatalogBrand[]): DirectusProductRecord {
  const specs = record.specifications ?? {};
  const admin = (specs['admin'] ?? {}) as Record<string, unknown>;
  const catalog = (specs['catalog'] ?? {}) as Record<string, unknown>;
  const brand = brands.find(item => item.id === admin['brandId']) ??
    brands.find(item => brandMatches(item, catalogProductBrand(record)));
  const rawLogos = record.brand_logos ?? catalog['brandLogos'];
  const logos = Array.isArray(rawLogos) ? rawLogos.map(logo => {
    if (!logo || typeof logo !== 'object') return logo;
    const found = brands.find(item => item.id === logo.brandId) ??
      brands.find(item => brandMatches(item, String(logo.alt ?? logo.name ?? '')));
    return found ? { brandId: found.id, src: found.logo, alt: found.name, logo: found.logo, name: found.name } : logo;
  }) : rawLogos;
  return { ...record, brand_logos: logos,
    specifications: brand ? { ...specs, brand: brand.name,
      admin: { ...admin, brand: brand.name, brandId: brand.id } } : specs };
}
