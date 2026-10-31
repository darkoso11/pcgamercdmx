import fs from 'node:fs';

export const brandKey = value => value.normalize('NFD').replace(/\p{M}/gu, '').trim().toLocaleLowerCase('es').replace(/\s+/g, ' ');
export const brandFields = [
  { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
  { field: 'name', type: 'string', schema: { is_nullable: false, max_length: 100 }, meta: { interface: 'input', required: true } },
  { field: 'key', type: 'string', schema: { is_nullable: false, is_unique: true, max_length: 100 }, meta: { interface: 'input', hidden: true } },
  { field: 'logo', type: 'string', schema: { is_nullable: true, max_length: 2048 }, meta: { interface: 'input' } },
  { field: 'aliases', type: 'json', schema: { is_nullable: true }, meta: { interface: 'input-code' } },
];
export const publicBrandFields = brandFields.map(field => field.field);

export function planBrands(products, existing = []) {
  const defaults = JSON.parse(fs.readFileSync(new URL('../src/app/features/products/default-brands.json', import.meta.url), 'utf8'));
  const names = new Set(existing.flatMap(brand => [brand.name, ...(brand.aliases ?? [])]).map(brandKey));
  const candidates = [...defaults];
  for (const product of products) {
    const specs = product.specifications ?? {};
    for (const name of [specs.admin?.brand, specs.brand, specs.catalog?.specifications?.brand]) {
      if (typeof name === 'string') candidates.push({ name, logo: '', aliases: [] });
    }
    const logos = product.brand_logos ?? specs.catalog?.brandLogos ?? [];
    for (const logo of Array.isArray(logos) ? logos : []) {
      if (logo && typeof (logo.alt ?? logo.name) === 'string') candidates.push({ name: logo.alt ?? logo.name, logo: logo.src ?? logo.logo ?? '', aliases: [] });
    }
  }
  const result = [];
  for (const candidate of candidates) {
    if (/[<>\r\n]|&(?:[a-z]+|#\d+);/i.test(candidate.name)) continue;
    const name = candidate.name.trim().replace(/\s+/g, ' ');
    const key = brandKey(name);
    if (!key || name.length > 100 || ['otro', 'otros', 'sin marca', 'no especificado'].includes(key)) continue;
    if (/interfaz de hardware|nombre del|dispositivos compatibles|fabricante del cpu|compatibilidad de la placa base|^del cable\b/.test(key)) continue;
    const logo = /^(https:\/\/|assets\/)/i.test(candidate.logo) ? candidate.logo : '';
    if (names.has(key)) {
      const planned = result.find(brand => [brand.name, ...brand.aliases].some(alias => brandKey(alias) === key));
      if (planned && !planned.logo && logo) planned.logo = logo;
      continue;
    }
    result.push({ name, key, logo, aliases: candidate.aliases });
    for (const alias of [name, ...candidate.aliases]) names.add(brandKey(alias));
  }
  return result;
}
