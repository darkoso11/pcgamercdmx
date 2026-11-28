import { selectFeaturedAssembly } from './home-featured-assembly';
import { AssembledPC } from '../../shared/models';

const product = (slug: string, price: number, image = slug + '.webp', discountedPrice?: number) =>
  ({ slug, title: slug, price, image, discountedPrice } as AssembledPC);

describe('Home featured assembly selection', () => {
  it('selects only from the five highest effective prices without changing catalog order', () => {
    const catalog = [product('budget', 100), ...Array.from({ length: 6 }, (_, i) => product('pc' + i, 1000 + i))];
    const original = [...catalog];
    expect(selectFeaturedAssembly(catalog, null, () => 0)?.slug).toBe('pc5');
    expect(selectFeaturedAssembly(catalog, null, () => .999)?.slug).toBe('pc1');
    expect(catalog).toEqual(original);
  });
  it('excludes the previously displayed image even when products share it', () => {
    const catalog = [product('one', 3000, 'same.webp'), product('two', 2000, 'same.webp'), product('three', 1000)];
    expect(selectFeaturedAssembly(catalog, 'same.webp', () => 0)?.slug).toBe('three');
  });
  it('uses the effective offer price and ignores incomplete entries', () => {
    expect(selectFeaturedAssembly([product('sale', 9000, 'sale.webp', 500), product('normal', 1000), product('missing', 10000, '')], null, () => 0)?.slug).toBe('normal');
  });
  it('handles empty catalogs and a single available image', () => {
    expect(selectFeaturedAssembly([], null)).toBeNull();
    expect(selectFeaturedAssembly([product('only', 1000)], 'only.webp')?.slug).toBe('only');
  });
});
