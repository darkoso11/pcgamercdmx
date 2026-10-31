import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planBrands, brandFields } from './brand-catalog-schema.mjs';

test('bootstrap is idempotent and keeps existing renamed brands', () => {
  const records = [{ specifications: { brand: '  Fabricante Único  ' } }, { specifications: { admin: { brand: 'fabricante unico' } } }];
  const planned = planBrands(records);
  assert.equal(planned.filter(brand => brand.key === 'fabricante unico').length, 1);
  assert.deepEqual(planBrands(records, planned), []);
  assert.equal(planBrands(records, [{ name: 'Renombrado', aliases: ['Fabricante Único'] }]).some(brand => brand.key === 'fabricante unico'), false);
});
test('bootstrap does not infer brands from product names or import generic labels', () => {
  const planned = planBrands([{ title: 'Tarjeta marca inventada', specifications: { brand: 'Otro' } }]);
  assert.equal(planned.some(brand => ['otro', 'marca inventada'].includes(brand.key)), false);
  assert.equal(brandFields.find(field => field.field === 'key').schema.is_unique, true);
});

test('bootstrap preserves an existing assembly logo when the default brand has no image', () => {
  const planned = planBrands([{ brand_logos: [{ alt: 'Razer', src: 'https://example.com/razer.png' }] }]);
  assert.equal(planned.find(brand => brand.name === 'Razer').logo, 'https://example.com/razer.png');
});

test('bootstrap does not turn legacy scraper fragments into new brands', () => {
  const records = ['MSI Dispositivos compatibles Ordenador personal Tipo de cone',
    'TP-Link Interfaz de hardware Ethernet', 'Razer Nombre del', 'del cable Vorago',
    'AMD Fabricante del CPU AMD', 'NZXT Compatibilidad de la placa base Mini ITX Tipo de estuch'];
  const planned = planBrands(records.map(brand => ({ specifications: { brand } })));
  assert.equal(planned.some(brand => records.includes(brand.name)), false);
});
