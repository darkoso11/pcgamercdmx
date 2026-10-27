import { getIndexingDirective } from './blog-indexing.utils';

describe('Indexing policy by hostname', () => {
  it('blocks only the exact testing hostname, ignoring case', () => {
    expect(getIndexingDirective('test.pcgamercdmx.com')).toBe('noindex');
    expect(getIndexingDirective('TEST.PCGAMERCDMX.COM')).toBe('noindex');
    for (const host of ['pcgamercdmx.com', 'www.pcgamercdmx.com', 'localhost', 'test.pcgamercdmx.com.example.org']) {
      expect(getIndexingDirective(host)).toBeUndefined();
    }
  });
});
