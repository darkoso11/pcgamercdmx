import { optimizedImageUrl } from './image-url.util';

describe('optimizedImageUrl', () => {
  it('requests a resized WebP rendition for Directus assets', () => {
    expect(optimizedImageUrl('https://cms.test.pcgamercdmx.com/assets/file-1', 320)).toBe(
      'https://cms.test.pcgamercdmx.com/assets/file-1?width=320&quality=75&format=webp&fit=contain'
    );
  });

  it('leaves local and unrelated images unchanged', () => {
    expect(optimizedImageUrl('assets/img/leon.png', 320)).toBe('assets/img/leon.png');
    expect(optimizedImageUrl('https://picsum.photos/id/1/1200/600', 320)).toBe(
      'https://picsum.photos/id/1/1200/600'
    );
  });
});
