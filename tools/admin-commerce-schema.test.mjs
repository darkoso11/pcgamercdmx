import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adminCommerceCollections,
  defaultPowerCertifications,
} from './admin-commerce-schema.mjs';

test('defines the offer controls required by both catalog domains', () => {
  const offers = adminCommerceCollections.find(
    (definition) => definition.collection === 'pc_offers'
  );
  const fields = new Set(offers.fields.map((field) => field.field));

  assert.ok(fields.has('catalog_domain'));
  assert.ok(fields.has('discount_type'));
  assert.ok(fields.has('discount_value'));
  assert.ok(fields.has('applicable_products'));
  assert.ok(fields.has('applicable_assemblies'));
  assert.ok(fields.has('active'));
  assert.ok(fields.has('show_badge'));
  assert.ok(offers.publicReadFields.includes('show_badge'));
  assert.ok(offers.publicReadFields.includes('applicable_assemblies'));
});

test('defines a reusable power certification library', () => {
  const certifications = adminCommerceCollections.find(
    (definition) => definition.collection === 'pc_power_certifications'
  );
  const fields = new Set(certifications.fields.map((field) => field.field));

  assert.deepEqual(
    ['name', 'image', 'active', 'sort'].every((field) => fields.has(field)),
    true
  );
});

test('seeds the certifications already used by the public catalog', () => {
  assert.deepEqual(
    defaultPowerCertifications.map((item) => item.name),
    ['80+ Bronze', '80+ Gold']
  );
});
