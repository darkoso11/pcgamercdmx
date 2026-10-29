import assert from 'node:assert/strict';

const test = process.env.BLOG_TEST_URL || 'https://test.pcgamercdmx.com';
for (const path of ['/', '/blog', '/blog/como-elegir-pc-gamer-cdmx', '/blog/not-found-seo-check', '/sitemap.xml', '/robots.txt']) {
  const response = await fetch(test + path);
  assert.match(response.headers.get('x-robots-tag') || '', /\bnoindex\b/i, `${path}: test must not be indexable`);
}
const production = await fetch('https://pcgamercdmx.com/blog');
assert.doesNotMatch(production.headers.get('x-robots-tag') || '', /\bnoindex\b/i, 'Production must not inherit test noindex');
console.log('Test responses use noindex; production does not inherit it.');
